import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Upload, Download, Play, Pause, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const MAX_SIZE = 20 * 1024 * 1024;

const MacaronPage = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // disc
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = r * 0.4; i < r * 0.97; i += 5) {
      ctx.beginPath(); ctx.arc(r, r, i, 0, Math.PI * 2); ctx.stroke();
    }
    // label
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
    // hole
    ctx.fillStyle = "#f5f5f5";
    ctx.beginPath(); ctx.arc(r, r, r * 0.025, 0, Math.PI * 2); ctx.fill();
    const a = document.createElement("a");
    a.download = "macaron-vinyle.png";
    a.href = c.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="tekno-container py-12">
      <Helmet>
        <title>Macaron vinyle – Visualisez votre label | Teknoland</title>
        <meta name="description" content="Uploadez votre image et visualisez-la en macaron sur un vinyle noir." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-2">Macaron</h1>
      <p className="text-muted-foreground mb-8">
        Uploadez votre image pour la voir en macaron au centre d'un vinyle.
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
              background:
                "repeating-radial-gradient(circle at center, #0a0a0a 0px, #0a0a0a 3px, #1a1a1a 4px, #0a0a0a 5px)",
              animation: spinning ? "spin 1.8s linear infinite" : undefined,
              animationPlayState: paused ? "paused" : undefined,
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
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2.5%] h-[2.5%] rounded-full bg-background" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacaronPage;
