import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Download, Play, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SR = 44100;

type Sample = { id: number; prompt: string; url: string };

// Interprète le texte et synthétise un son (mots-clés FR/EN)
function synth(prompt: string): Float32Array {
  const p = prompt.toLowerCase();
  const has = (...w: string[]) => w.some((x) => p.includes(x));
  const low = has("grave", "deep", "low", "808", "bass", "basse");
  const high = has("aigu", "high", "bright", "brillant");
  const long = has("long", "sustain", "pad", "nappe");
  const pitch = low ? 0.5 : high ? 2 : 1;
  const secMatch = p.match(/(\d+(?:\.\d+)?)\s*s/);

  let dur = long ? 3 : 1;
  let gen: (t: number, i: number) => number;

  if (has("kick", "grosse caisse")) {
    dur = 0.6;
    let ph = 0;
    gen = (t) => {
      const f = 40 * pitch + 110 * Math.exp(-t * 30);
      ph += (2 * Math.PI * f) / SR;
      return Math.sin(ph) * Math.exp(-t * (low ? 4 : 7));
    };
  } else if (has("snare", "caisse claire", "clap")) {
    dur = 0.4;
    gen = (t) => ((Math.random() * 2 - 1) * 0.8 + Math.sin(2 * Math.PI * 190 * pitch * t) * 0.4) * Math.exp(-t * 18);
  } else if (has("hat", "hihat", "charley", "cymbal")) {
    dur = has("open", "ouvert") ? 0.5 : 0.12;
    let prev = 0;
    gen = (t) => {
      const n = Math.random() * 2 - 1;
      const hp = n - prev;
      prev = n;
      return hp * 0.6 * Math.exp(-t * (dur < 0.2 ? 40 : 9));
    };
  } else if (has("noise", "bruit", "riser", "sweep", "wind", "vent")) {
    dur = long ? 4 : 2;
    let lp = 0;
    gen = (t) => {
      const k = has("riser", "sweep") ? 0.02 + (t / dur) * 0.5 : 0.08;
      lp += k * ((Math.random() * 2 - 1) - lp);
      return lp * 2 * Math.min(1, t * 4, (dur - t) * 4);
    };
  } else {
    // tonal : bass, pad, lead, pluck, bip…
    const base = (has("bass", "basse", "808") ? 55 : has("pad", "nappe") ? 220 : 440) * pitch;
    const wave = has("square", "carré") ? "sq" : has("saw", "scie", "lead") ? "saw" : "sin";
    const pluck = has("pluck", "pincé", "bip", "blip");
    if (pluck) dur = 0.5;
    gen = (t) => {
      const osc = (f: number) => {
        const x = (f * t) % 1;
        return wave === "sq" ? (x < 0.5 ? 1 : -1) * 0.5 : wave === "saw" ? (2 * x - 1) * 0.5 : Math.sin(2 * Math.PI * f * t);
      };
      const v = has("pad", "nappe") ? (osc(base) + osc(base * 1.005) + osc(base * 1.5)) / 3 : osc(base);
      const env = pluck ? Math.exp(-t * 8) : Math.min(1, t * 20, (dur - t) * 5);
      return v * env;
    };
  }
  if (secMatch) dur = Math.min(10, Math.max(0.1, parseFloat(secMatch[1])));

  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.max(-1, Math.min(1, gen(i / SR, i) * 0.9));
  return out;
}

function toWav(data: Float32Array): Blob {
  const buf = new ArrayBuffer(44 + data.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + data.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, SR, true); v.setUint32(28, SR * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, data.length * 2, true);
  data.forEach((s, i) => v.setInt16(44 + i * 2, s * 0x7fff, true));
  return new Blob([buf], { type: "audio/wav" });
}

const EXAMPLES = ["kick 808 grave", "snare", "hihat ouvert", "bass saw", "pad long", "riser 4s", "pluck aigu"];

const SamplesPage = () => {
  const [prompt, setPrompt] = useState("");
  const [samples, setSamples] = useState<Sample[]>([]);
  const [mode, setMode] = useState<"synth" | "voice">("synth");
  const [voice, setVoice] = useState("Kore");
  const [loading, setLoading] = useState(false);

  const add = (text: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setSamples((s) => [{ id: Date.now(), prompt: text, url }, ...s]);
    new Audio(url).play();
  };

  const generateVoice = async (text: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return toast.error("Connectez-vous pour générer une voix.");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Échec de la génération");
      add(text, await res.blob());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const generate = (text = prompt) => {
    if (!text.trim() || loading) return;
    if (mode === "voice") return generateVoice(text.trim());
    add(text, toWav(synth(text)));
  };

  return (
    <div className="tekno-container py-12 max-w-3xl">
      <Helmet>
        <title>Samples – Générateur de sons WAV | Teknoland</title>
        <meta name="description" content="Créez des samples audio WAV à partir d'un texte et téléchargez-les." />
      </Helmet>
      <h1 className="text-3xl font-bold mb-2">Samples</h1>
      <p className="text-muted-foreground mb-6">Décrivez un son (kick, snare, hihat, bass, pad, riser, pluck…, grave/aigu, durée en s) puis téléchargez-le en WAV.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={mode === "synth" ? "default" : "outline"} onClick={() => setMode("synth")}>Sons (kick, pad…)</Button>
        <Button variant={mode === "voice" ? "default" : "outline"} onClick={() => setMode("voice")}>Voix (mots, phrases)</Button>
        {mode === "voice" && (
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className="border rounded-md px-3 bg-background" aria-label="Voix">
            {["Kore", "Puck", "Charon", "Fenrir", "Aoede", "Leda"].map((v) => <option key={v}>{v}</option>)}
          </select>
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); generate(); }} className="flex gap-2 mb-3">
        <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={mode === "voice" ? "ex : Bienvenue chez Teknoland" : "ex : kick 808 grave"} maxLength={500} />
        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}Générer</Button>
      </form>
      {mode === "synth" && <div className="flex flex-wrap gap-2 mb-8">
        {EXAMPLES.map((ex) => (
          <Button key={ex} size="sm" variant="outline" onClick={() => { setPrompt(ex); generate(ex); }}>{ex}</Button>
        ))}
      </div>}
      {mode === "voice" && <p className="text-sm text-muted-foreground mb-8">Astuce : ajoutez le ton, ex. « Dis avec énergie : Teknoland ! ». Connexion requise.</p>}

      <ul className="space-y-3">
        {samples.map((s) => (
          <li key={s.id} className="flex items-center gap-3 border rounded-lg p-3">
            <Button size="icon" variant="ghost" onClick={() => new Audio(s.url).play()} aria-label="Écouter"><Play className="h-4 w-4" /></Button>
            <span className="flex-1 font-medium">{s.prompt}</span>
            <Button size="sm" asChild>
              <a href={s.url} download={`${s.prompt.replace(/[^\w-]+/g, "_")}.wav`}><Download className="mr-2 h-4 w-4" />WAV</a>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SamplesPage;
