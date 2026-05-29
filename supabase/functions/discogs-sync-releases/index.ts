import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
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

  const startedAt = Date.now();
  let callerId = "cron";

  // Auth: either admin JWT or shared cron secret
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedCron = Deno.env.get("DISCOGS_CRON_SECRET");
  const isCron = !!expectedCron && cronSecret === expectedCron;

  if (!isCron) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    callerId = user.id;
  }

  console.log(`[discogs-sync-releases] start caller=${callerId} at=${new Date().toISOString()}`);

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
        // Filtre : ne garder que les vinyles
        const fmt = Array.isArray(r.format)
          ? r.format.join(",").toLowerCase()
          : String(r.format ?? "").toLowerCase();
        if (!fmt.includes("vinyl")) continue;
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

      // Supprime les releases qui ne sont plus dans le set vinyles
      const vinylIds = allReleases.map((r) => r.release_id);
      await supabase
        .from("discogs_releases")
        .delete()
        .not("release_id", "in", `(${vinylIds.join(",")})`);
    }

    await supabase
      .from("discogs_sync_state")
      .update({ last_full_sync_at: new Date().toISOString() })
      .eq("singleton", true);

    console.log(`[discogs-sync-releases] done caller=${callerId} imported=${imported} duration_ms=${Date.now() - startedAt}`);
    return new Response(JSON.stringify({ ok: true, imported }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(`[discogs-sync-releases] error caller=${callerId} duration_ms=${Date.now() - startedAt}`, e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});