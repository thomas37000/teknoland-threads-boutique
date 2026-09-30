import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Upload, Download, Play, Pause, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const MAX_SIZE = 20 * 1024 * 1024;

interface VinylOption {
  id: string;
  label: string;
  marbled?: boolean;
  /** Couleur unie */
  base?: string;
  /** Couleurs du marbrage (dégradé conique) */
  swirl?: string[];
  /** Couleur des sillons pour un vinyle uni */
  groove?: string;
}

const SOLID_VINYLS: VinylOption[] = [
  { id: "noir", label: "Noir", base: "#0a0a0a", groove: "rgba(255,255,255,0.05)" },
  { id: "blanc", label: "Blanc", base: "#ececec", groove: "rgba(0,0,0,0.10)" },
  { id: "rouge", label: "Rouge", base: "#b3001b", groove: "rgba(0,0,0,0.20)" },
  { id: "bleu", label: "Bleu", base: "#0b3d91", groove: "rgba(0,0,0,0.22)" },
  { id: "orange", label: "Orange", base: "#e05e00", groove: "rgba(0,0,0,0.18)" },
  { id: "vert", label: "Vert", base: "#15803d", groove: "rgba(0,0,0,0.20)" },
  { id: "jaune", label: "Jaune", base: "#f2c500", groove: "rgba(0,0,0,0.18)" },
  { id: "rose", label: "Rose", base: "#e75480", groove: "rgba(0,0,0,0.15)" },
  { id: "or", label: "Or", base: "#c9a227", groove: "rgba(0,0,0,0.18)" },
  { id: "gris", label: "Gris", base: "#8a8f96", groove: "rgba(0,0,0,0.18)" },
  { id: "transparent", label: "Transparent", base: "#cfd4da", groove: "rgba(255,255,255,0.45)" },
];

/** Marbrés inspirés des pressages Vinylium (blanc-noir, rouge/noir, or-noir, etc.) */
const MARBLED_VINYLS: VinylOption[] = [
  { id: "marbre-blanc-noir", label: "Marbré blanc / noir", marbled: true, swirl: ["#e8e8e8", "#0a0a0a", "#f5f5f5", "#2a2a2a", "#d0d0d0"] },
  { id: "marbre-rouge-noir", label: "Marbré rouge / noir", marbled: true, swirl: ["#b3001b", "#1a0004", "#d43a4a", "#40000a", "#8a0014"] },
  { id: "marbre-orange-noir", label: "Marbré orange / noir", marbled: true, swirl: ["#e05e00", "#1c0d00", "#f28a33", "#3d1f00", "#c24d00"] },
  { id: "marbre-bleu-pale-noir", label: "Marbré bleu pâle / noir", marbled: true, swirl: ["#9db8d9", "#0a0a0a", "#c9d9ee", "#1f2937", "#6e8bb5"] },
  { id: "marbre-vert-noir", label: "Marbré vert / noir", marbled: true, swirl: ["#15803d", "#04140a", "#4ade80", "#0a2e18", "#166534"] },
  { id: "marbre-blanc-rose", label: "Marbré blanc / rose", marbled: true, swirl: ["#f4f4f4", "#e75480", "#ffffff", "#c2185b", "#fce7ef"] },
  { id: "marbre-or-noir", label: "Marbré or / noir", marbled: true, swirl: ["#c9a227", "#0a0a0a", "#e6c964", "#4a3a08", "#a3841a"] },
  { id: "marbre-rose-jaune", label: "Marbré rose fluo / jaune", marbled: true, swirl: ["#ff2fa0", "#ffd400", "#ff7ac8", "#ffe873", "#d1006e"] },
  { id: "marbre-transparent-noir-rouge", label: "Marbré transparent / noir / rouge", marbled: true, swirl: ["#cfd4da", "#0a0a0a", "#b3001b", "#8a8f96", "#6b0011"] },
  { id: "marbre-multicolore", label: "Marbré multicolore", marbled: true, swirl: ["#cfd4da", "#1a5cc8", "#e75480", "#ffd400", "#8fb7e8"] },
];

const VINYL_OPTIONS: VinylOption[] = [...SOLID_VINYLS, ...MARBLED_VINYLS];

const marbledSwatch = (swirl: string[]) =>
  `conic-gradient(from 45deg, ${swirl.join(", ")}, ${swirl[0]})`;

/** Luminance approximative pour choisir une couleur de trou contrastée */
const isLight = (hex: string) => {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 140;
};

const previewBackground = (option: VinylOption): string => {
  if (option.marbled && option.swirl) {
    return `repeating-radial-gradient(circle at center, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 3px, rgba(0,0,0,0.12) 4px, rgba(255,255,255,0.05) 5px), ${marbledSwatch(option.swirl)}`;
  }
  return `repeating-radial-gradient(circle at center, ${option.base} 0px, ${option.base} 3px, ${option.groove} 4px, ${option.base} 5px)`;
};

const MacaronPage = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [dragOver, setDragOver] = useState(false);
  const [vinylId, setVinylId] = useState("noir");
  const [customColor, setCustomColor] = useState("#b3001b");
  const inputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const customVinyl: VinylOption = {
    id: "perso",
    label: "Personnalisée",
    base: customColor,
    groove: isLight(customColor) ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)",
  };
  const vinyl =
    vinylId === "perso"
      ? customVinyl
      : VINYL_OPTIONS.find((v) => v.id === vinylId) ?? SOLID_VINYLS[0];

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_SIZE) return toast.error("L'image ne doit pas dépasser 20 Mo");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setImageUrl(url); setZoom(100); };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Format non lisible par votre navigateur (ex : HEIC). Convertissez en JPG ou PNG.");
    };
    img.src = url;
  };

  const downloadMockup = async () => {
    if (!imageUrl) return;
    const size = 1200;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const r = size / 2;

    // disque : couleur unie ou marbrage
    ctx.save();
    ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.clip();
    if (vinyl.marbled && vinyl.swirl) {
      if (typeof (ctx as any).createConicGradient === "function") {
        const g = (ctx as any).createConicGradient(0, r, r) as CanvasGradient;
        const n = vinyl.swirl.length;
        vinyl.swirl.forEach((col, i) => g.addColorStop(i / n, col));
        g.addColorStop(1, vinyl.swirl[0]);
        ctx.fillStyle = g;
      } else {
        // repli : ailes de papillon alternées
        ctx.fillStyle = vinyl.swirl[0];
      }
      ctx.fillRect(0, 0, size, size);
      // sillons translucides par-dessus le marbrage
      for (let i = r * 0.4; i < r * 0.97; i += 5) {
        ctx.beginPath(); ctx.arc(r, r, i, 0, Math.PI * 2);
        ctx.strokeStyle = i % 10 === 0 ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.05)";
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = vinyl.base!;
      ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = vinyl.groove!;
      for (let i = r * 0.4; i < r * 0.97; i += 5) {
        ctx.beginPath(); ctx.arc(r, r, i, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();

    // macaron
    const img = new Image();
    img.src = imageUrl;
    await img.decode();
    const lr = r * 0.36;
    ctx.save();
    ctx.beginPath(); ctx.arc(r, r, lr, 0, Math.PI * 2); ctx.clip();
    const s = (lr * 2 * zoom) / 100;
    const scale = Math.max(s / img.width, s / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, r - w / 2, r - h / 2, w, h);
    ctx.restore();

    // trou central
    const holeColor = vinyl.marbled || !isLight(vinyl.base!) ? "#f5f5f5" : "#333333";
    ctx.fillStyle = holeColor;
    ctx.beginPath(); ctx.arc(r, r, r * 0.025, 0, Math.PI * 2); ctx.fill();

    const a = document.createElement("a");
    a.download = `macaron-vinyle-${vinyl.id}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="tekno-container py-12">
      <Helmet>
        <title>Macaron vinyle – Visualisez votre label | Teknoland</title>
        <meta name="description" content="Uploadez votre image et visualisez-la en macaron sur un vinyle noir, coloré ou marbré." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-2">Macaron</h1>
      <p className="text-muted-foreground mb-8">
        Uploadez votre image pour la voir en macaron au centre d'un vinyle. Choisissez la couleur du vinyle, unie ou marbrée.
      </p>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-muted" : "border-border hover:bg-muted/50"
            }`}
          >
            <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Cliquez ou glissez votre image ici</p>
            <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WEBP, GIF, SVG, AVIF, BMP… (20 Mo max)</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Couleur du vinyle</h3>
            <div className="flex flex-wrap gap-2">
              {VINYL_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  title={option.label}
                  onClick={() => setVinylId(option.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full border transition-colors ${
                    vinylId === option.id
                      ? "border-primary ring-1 ring-primary bg-muted"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-border shrink-0"
                    style={{
                      background: option.marbled && option.swirl
                        ? marbledSwatch(option.swirl)
                        : option.base,
                    }}
                  />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {imageUrl && (
            <>
              <div>
                <p className="text-sm font-medium mb-2">Zoom : {zoom}%</p>
                <Slider min={100} max={300} step={5} value={[zoom]} onValueChange={(v) => setZoom(v[0])} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!spinning) { setSpinning(true); setPaused(false); }
                    else setPaused((p) => !p);
                  }}
                >
                  {spinning && !paused ? (
                    <><Pause className="mr-2 h-4 w-4" />Pause</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4" />Lecture</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  disabled={!spinning}
                  onClick={() => { setSpinning(false); setPaused(false); }}
                >
                  <Square className="mr-2 h-4 w-4" />Stop
                </Button>
                <Button onClick={downloadMockup}>
                  <Download className="mr-2 h-4 w-4" />Télécharger l'aperçu
                </Button>
                <Button variant="ghost" onClick={() => { setImageUrl(null); setSpinning(false); setPaused(false); }}>
                  <X className="mr-2 h-4 w-4" />Retirer
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-center">
          <div
            className="relative w-full max-w-md aspect-square rounded-full shadow-2xl"
            style={{
              background: previewBackground(vinyl),
              animation: spinning && imageUrl ? "spin 1.8s linear infinite" : "none",
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: "conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.08) 30deg, transparent 70deg, transparent 180deg, rgba(255,255,255,0.08) 210deg, transparent 250deg)" }}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[36%] h-[36%] rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Macaron"
                  className="w-full h-full object-cover"
                  style={{ transform: `scale(${zoom / 100})` }}
                />
              ) : (
                <span className="text-xs text-muted-foreground px-2 text-center">Votre image</span>
              )}
            </div>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2.5%] h-[2.5%] rounded-full"
              style={{ background: vinyl.marbled || !isLight(vinyl.base!) ? "hsl(var(--background))" : "#333333" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacaronPage;
