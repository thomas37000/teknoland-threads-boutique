import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const VOICES = ["Kore", "Puck", "Charon", "Fenrir", "Aoede", "Leda"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, status: number) =>
    new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

  // Utilisateur connecté requis (évite les abus de crédits)
  const auth = req.headers.get("Authorization") ?? "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return json({ error: "Connectez-vous pour générer une voix." }, 401);

  const { text, voice } = await req.json().catch(() => ({}));
  if (typeof text !== "string" || !text.trim() || text.length > 500)
    return json({ error: "Texte requis (500 caractères max)." }, 400);
  const voiceName = VOICES.includes(voice) ? voice : "Kore";

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-tts-preview",
      contents: [{ role: "user", parts: [{ text: text.trim() }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
      stream_format: "audio",
    }),
  });

  if (!upstream.ok) {
    const msg = await upstream.text();
    console.error("TTS error", upstream.status, msg);
    const error = upstream.status === 402 ? "Crédits IA épuisés." : upstream.status === 429 ? "Trop de demandes, réessayez dans un instant." : "Échec de la génération de la voix.";
    return json({ error }, upstream.status);
  }
  return new Response(upstream.body, {
    status: 200,
    headers: { ...cors, "Content-Type": upstream.headers.get("Content-Type") ?? "audio/wav", "Cache-Control": "no-cache" },
  });
});
