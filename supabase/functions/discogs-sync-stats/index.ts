import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const USER_AGENT = "TeknolandApp/1.0 +https://teknoland.app";
const BATCH_SIZE = 40; // releases per invocation
const REQUEST_DELAY_MS = 1100;

function authHeaders() {
  const token = Deno.env.get("DISCOGS_USER_TOKEN");
  const h: Record<string, string> = { "User-Agent": USER_AGENT };
  if (token) h["Authorization"] = `Discogs token=${token}`;
  return h;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: state } = await supabase
      .from("discogs_sync_state")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();

    const cursor = state?.last_stats_cursor ?? 0;

    const { data: releases, error: relErr } = await supabase
      .from("discogs_releases")
      .select("release_id, current_collection_count, current_wantlist_count")
      .order("release_id", { ascending: true })
      .range(cursor, cursor + BATCH_SIZE - 1);

    if (relErr) throw relErr;

    let processed = 0;
    let totalDeltaCollection = 0;
    let totalDeltaWantlist = 0;
    const historyRows: any[] = [];
    const updates: { release_id: number; have: number; want: number }[] = [];

    for (const rel of releases ?? []) {
      const url = `https://api.discogs.com/releases/${rel.release_id}`;
      const res = await fetch(url, { headers: authHeaders() });

      if (res.status === 429) {
        console.warn("Rate limited, sleeping 60s");
        await sleep(60_000);
        continue;
      }
      if (!res.ok) {
        console.warn(`Skip release ${rel.release_id}: ${res.status}`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const remaining = Number(res.headers.get("X-Discogs-Ratelimit-Remaining") ?? "60");
      const data = await res.json();
      const have = Number(data?.community?.have ?? 0);
      const want = Number(data?.community?.want ?? 0);

      const dColl = have - (rel.current_collection_count ?? 0);
      const dWant = want - (rel.current_wantlist_count ?? 0);

      historyRows.push({
        release_id: rel.release_id,
        collection_count: have,
        wantlist_count: want,
        delta_collection: dColl,
        delta_wantlist: dWant,
      });
      updates.push({ release_id: rel.release_id, have, want });

      if (dColl > 0) totalDeltaCollection += dColl;
      if (dWant > 0) totalDeltaWantlist += dWant;
      processed += 1;

      if (remaining < 5) await sleep(60_000);
      else await sleep(REQUEST_DELAY_MS);
    }

    if (historyRows.length) {
      await supabase.from("discogs_stats_history").insert(historyRows);
    }

    for (const u of updates) {
      await supabase
        .from("discogs_releases")
        .update({
          current_collection_count: u.have,
          current_wantlist_count: u.want,
          last_synced_at: new Date().toISOString(),
        })
        .eq("release_id", u.release_id);
    }

    // Advance cursor; reset if batch under-filled
    const nextCursor = (releases?.length ?? 0) < BATCH_SIZE ? 0 : cursor + BATCH_SIZE;

    await supabase
      .from("discogs_sync_state")
      .update({
        last_stats_sync_at: new Date().toISOString(),
        last_stats_cursor: nextCursor,
        unseen_collection_delta: (state?.unseen_collection_delta ?? 0) + totalDeltaCollection,
        unseen_wantlist_delta: (state?.unseen_wantlist_delta ?? 0) + totalDeltaWantlist,
      })
      .eq("singleton", true);

    return new Response(
      JSON.stringify({ ok: true, processed, totalDeltaCollection, totalDeltaWantlist, nextCursor }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("discogs-sync-stats error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});