import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AIRTABLE_URL = Deno.env.get("VITE_AIRTABLE_URL")!;
const AIRTABLE_KEY = Deno.env.get("VITE_AIRTABLE_KEY")!;
const SOUNDCLOUD_CLIENT_ID = Deno.env.get("SOUNDCLOUD_CLIENT_ID")!;

async function airtableFetch(path: string, init?: RequestInit) {
  return fetch(`${AIRTABLE_URL}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${AIRTABLE_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function listAllArtists() {
  const records: any[] = [];
  let offset: string | undefined;
  do {
    const qs = offset ? `?offset=${encodeURIComponent(offset)}` : "";
    const res = await airtableFetch(`Artistes${qs}`);
    if (!res.ok) throw new Error(`Airtable list failed: ${res.status}`);
    const data = await res.json();
    records.push(...(data.records ?? []));
    offset = data.offset;
  } while (offset);
  return records;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!AIRTABLE_URL || !AIRTABLE_KEY || !SOUNDCLOUD_CLIENT_ID) {
    return new Response(JSON.stringify({ error: "Missing env config" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const started = Date.now();
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    const artists = await listAllArtists();
    console.log(`[soundcloud-sync] processing ${artists.length} artists`);

    for (const artist of artists) {
      const f = artist.fields ?? {};
      const scUrl = f["Soundcloud_url"];
      const name = f["Name"] ?? "(unnamed)";

      if (!scUrl) {
        skipped++;
        continue;
      }

      try {
        const resolveUrl = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(scUrl)}&client_id=${SOUNDCLOUD_CLIENT_ID}`;
        const scRes = await fetch(resolveUrl);
        if (!scRes.ok) {
          errors.push(`${name}: SC ${scRes.status}`);
          skipped++;
          continue;
        }
        const sc = await scRes.json();
        const newCount: number = sc.followers_count ?? 0;
        const userId: number | string | undefined = sc.id;
        const prev: number = Number(f["Followers Count"] ?? f["Followers"] ?? 0);
        const delta = newCount - prev;

        const patchRes = await airtableFetch(`Artistes/${artist.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fields: {
              "SoundCloud User ID": userId ? String(userId) : "",
              "Followers Count": newCount,
              "Followers Delta": delta,
              "Last Sync": new Date().toISOString(),
            },
          }),
        });

        if (!patchRes.ok) {
          const txt = await patchRes.text();
          errors.push(`${name}: Airtable PATCH ${patchRes.status} ${txt.slice(0, 120)}`);
          skipped++;
          continue;
        }

        updated++;
        await new Promise((r) => setTimeout(r, 250));
      } catch (err) {
        errors.push(`${name}: ${(err as Error).message}`);
        skipped++;
      }
    }

    const duration = Date.now() - started;
    console.log(`[soundcloud-sync] done in ${duration}ms updated=${updated} skipped=${skipped} errors=${errors.length}`);

    return new Response(
      JSON.stringify({ success: true, updated, skipped, total: artists.length, duration_ms: duration, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[soundcloud-sync] fatal", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});