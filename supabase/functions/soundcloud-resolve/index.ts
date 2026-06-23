import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOUNDCLOUD_CLIENT_ID =
  Deno.env.get("SOUNDCLOUD_CLIENT_ID") ??
  Deno.env.get("VITE_SOUNDCLOUD_CLIENT_ID") ??
  "";
const SOUNDCLOUD_CLIENT_SECRET =
  Deno.env.get("SOUNDCLOUD_CLIENT_SECRET") ??
  Deno.env.get("VITE_SOUNDCLOUD_CLIENT_SECRET") ??
  "";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!SOUNDCLOUD_CLIENT_SECRET || !SOUNDCLOUD_CLIENT_ID) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const res = await fetch("https://api.soundcloud.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json; charset=utf-8",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: SOUNDCLOUD_CLIENT_ID,
      client_secret: SOUNDCLOUD_CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    console.error(`[soundcloud-resolve] token ${res.status} ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!SOUNDCLOUD_CLIENT_ID) {
      return new Response(JSON.stringify({ error: "Missing SOUNDCLOUD_CLIENT_ID" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { url } = await req.json().catch(() => ({ url: "" }));
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'url' in body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getAccessToken();
    const endpoint = token
      ? `https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}`
      : `https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${SOUNDCLOUD_CLIENT_ID}`;
    const headers: Record<string, string> = { Accept: "application/json; charset=utf-8" };
    if (token) headers["Authorization"] = `OAuth ${token}`;

    const res = await fetch(endpoint, { headers });
    if (!res.ok) {
      const txt = await res.text();
      return new Response(
        JSON.stringify({ error: `resolve ${res.status}`, details: txt.slice(0, 300) }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const data = await res.json();
    if (!data || typeof data.id !== "number") {
      return new Response(
        JSON.stringify({ error: "no numeric id returned", data }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        username: data.username ?? null,
        permalink_url: data.permalink_url ?? null,
        followers_count: data.followers_count ?? null,
        kind: data.kind ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[soundcloud-resolve] fatal", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});