import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AIRTABLE_URL = Deno.env.get("VITE_AIRTABLE_URL")!;
const AIRTABLE_KEY = Deno.env.get("VITE_AIRTABLE_KEY")!;
const SOUNDCLOUD_CLIENT_ID =
  Deno.env.get("SOUNDCLOUD_CLIENT_ID") ??
  Deno.env.get("VITE_SOUNDCLOUD_CLIENT_ID") ??
  "";
const SOUNDCLOUD_CLIENT_SECRET =
  Deno.env.get("SOUNDCLOUD_CLIENT_SECRET") ??
  Deno.env.get("VITE_SOUNDCLOUD_CLIENT_SECRET") ??
  "";

// Token cache for OAuth2 client_credentials flow (SoundCloud API v2 requires it)
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!SOUNDCLOUD_CLIENT_SECRET) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const res = await fetch("https://api.soundcloud.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json; charset=utf-8" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: SOUNDCLOUD_CLIENT_ID,
      client_secret: SOUNDCLOUD_CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`[soundcloud-sync] token fetch failed ${res.status} ${txt.slice(0, 200)}`);
    return null;
  }
  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

async function scFetch(url: string, token: string | null): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json; charset=utf-8" };
  if (token) headers["Authorization"] = `OAuth ${token}`;
  return fetch(url, { headers });
}

async function resolveUrl(url: string, token: string | null) {
  // Try up to 2 times
  for (let attempt = 0; attempt < 2; attempt++) {
    const endpoint = token
      ? `https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}`
      : `https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${SOUNDCLOUD_CLIENT_ID}`;
    const res = await scFetch(endpoint, token);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.id === "number") return data;
    } else if (res.status === 401 || res.status === 403) {
      return { __error: `resolve ${res.status}` };
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return { __error: "resolve: no numeric id" };
}

async function fetchUser(userId: string | number, token: string | null) {
  const endpoint = token
    ? `https://api.soundcloud.com/users/${userId}`
    : `https://api.soundcloud.com/users/${userId}?client_id=${SOUNDCLOUD_CLIENT_ID}`;
  const res = await scFetch(endpoint, token);
  if (!res.ok) return { __error: `users ${res.status}` };
  return await res.json();
}

// Compteur d'utilisation Airtable (partagé via la table public.airtable_usage)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const usageClient = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

function incrementAirtableUsage(delta = 1) {
  if (!usageClient) return;
  usageClient.rpc("increment_airtable_usage", { _delta: delta }).then(({ error }) => {
    if (error) console.error("increment_airtable_usage error", error);
  });
}

async function airtableFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${AIRTABLE_URL}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${AIRTABLE_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  incrementAirtableUsage(1);
  return res;
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
    return new Response(JSON.stringify({
      error: "Missing env config",
      missing: {
        VITE_AIRTABLE_URL: !AIRTABLE_URL,
        VITE_AIRTABLE_KEY: !AIRTABLE_KEY,
        SOUNDCLOUD_CLIENT_ID: !SOUNDCLOUD_CLIENT_ID,
      },
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const started = Date.now();
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn("[soundcloud-sync] no OAuth token (missing SOUNDCLOUD_CLIENT_SECRET or token request failed); falling back to client_id query param");
    }
    const artists = await listAllArtists();
    console.log(`[soundcloud-sync] processing ${artists.length} artists`);

    for (const artist of artists) {
      const f = artist.fields ?? {};
      const scUrl = f["Soundcloud_url"];
      const name = f["Name"] ?? "(unnamed)";
      let storedUserId = f["SoundCloud User ID"];

      if (!scUrl) {
        skipped++;
        continue;
      }

      try {
        let userId: number | string | undefined;
        let username: string | undefined;
        let permalinkUrl: string | undefined;
        let userData: any = null;

        // Step 1: ensure we have a numeric user id (resolve URL if missing/invalid)
        if (!storedUserId || !/^\d+$/.test(String(storedUserId))) {
          const resolved = await resolveUrl(scUrl, token);
          if (resolved.__error || typeof resolved.id !== "number") {
            errors.push(`${name}: ${resolved.__error ?? "resolve failed"}`);
            skipped++;
            continue;
          }
          userId = resolved.id;
          username = resolved.username;
          permalinkUrl = resolved.permalink_url;
          userData = resolved;
        } else {
          userId = storedUserId;
        }

        // Step 2: always fetch fresh user data via /users/{id}
        const user = await fetchUser(userId!, token);
        if (user.__error || typeof user.id !== "number") {
          // fallback: re-resolve once
          const resolved = await resolveUrl(scUrl, token);
          if (resolved.__error || typeof resolved.id !== "number") {
            errors.push(`${name}: ${user.__error ?? "users failed"} / ${resolved.__error ?? "re-resolve failed"}`);
            skipped++;
            continue;
          }
          userId = resolved.id;
          username = resolved.username;
          permalinkUrl = resolved.permalink_url;
          userData = resolved;
        } else {
          userId = user.id;
          username = user.username ?? username;
          permalinkUrl = user.permalink_url ?? permalinkUrl;
          userData = user;
        }

        const newCount: number = userData.followers_count ?? 0;
        const prev: number = Number(f["Followers Count"] ?? f["Followers"] ?? 0);
        const delta = newCount - prev;

        const patchRes = await airtableFetch(`Artistes/${artist.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fields: {
              "SoundCloud User ID": String(userId),
              "SoundCloud Username": username ?? "",
              "SoundCloud Permalink": permalinkUrl ?? "",
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