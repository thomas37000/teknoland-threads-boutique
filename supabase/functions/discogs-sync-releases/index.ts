import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LABEL_ID = 1625918;
const USER_AGENT = "TeknolandApp/1.0 +https://teknoland.app";

function authHeaders() {
  const token = Deno.env.get("DISCOGS_USER_TOKEN");
  const h: Record<string, string> = { "User-Agent": USER_AGENT };
  if (token) h["Authorization"] = `Discogs token=${token}`;
  return h;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    let page = 1;
    let totalPages = 1;
    let imported = 0;
    const allReleases: any[] = [];

    do {
      const url = `https://api.discogs.com/labels/${LABEL_ID}/releases?per_page=100&page=${page}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Discogs ${res.status}: ${txt}`);
      }
      const data = await res.json();
      totalPages = data.pagination?.pages ?? 1;
      for (const r of data.releases ?? []) {
        allReleases.push({
          release_id: r.id,
          title: r.title ?? "",
          artist: r.artist ?? null,
          year: r.year ? Number(r.year) : null,
          thumbnail: r.thumb ?? null,
          discogs_url: `https://www.discogs.com/release/${r.id}`,
        });
      }
      page += 1;
      await sleep(1100);
    } while (page <= totalPages);

    // Upsert by release_id
    if (allReleases.length) {
      const { error } = await supabase
        .from("discogs_releases")
        .upsert(allReleases, { onConflict: "release_id", ignoreDuplicates: false });
      if (error) throw error;
      imported = allReleases.length;
    }

    await supabase
      .from("discogs_sync_state")
      .update({ last_full_sync_at: new Date().toISOString() })
      .eq("singleton", true);

    return new Response(JSON.stringify({ ok: true, imported }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("discogs-sync-releases error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});