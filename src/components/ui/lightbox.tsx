import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Maximize2, Minimize2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Visionneuse d'image (lightbox).
 * ------------------------------
 * Ouvre l'image au clic, en grand, par-dessus la page.
 *
 * - Fermeture : clic sur le fond sombre, croix, touche Échap, ou clic sur l'image.
 * - "Taille réelle" : affiche l'image à ses dimensions natives (100 %).
 *   Si elle est plus grande que l'écran, on peut faire défiler.
 * - Les flèches du clavier ne sont pas utilisées : une seule image à la fois.
 *
 * Utilisation :
 *   <Lightbox src={url} alt="..." open={open} onOpenChange={setOpen} />
 */
export interface LightboxProps {
  src?: string | null;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Légende affichée sous l'image (facultatif). */
  caption?: string;
  className?: string;
}

export const Lightbox = ({ src, alt = "", open, onOpenChange, caption, className }: LightboxProps) => {
  const [natural, setNatural] = React.useState<{ w: number; h: number } | null>(null);
  const [actualSize, setActualSize] = React.useState(false);

  // À chaque ouverture, on repart sur l'affichage "ajusté à l'écran".
  React.useEffect(() => {
    if (open) {
      setActualSize(false);
      setNatural(null);
    }
  }, [open, src]);

  if (!src) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-label={alt || "Image agrandie"}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 p-4 outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className,
          )}
        >
          {/* Clic sur cette zone (le tour de l'image) = fermeture. */}
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              aria-label="Fermer"
              className="absolute inset-0 cursor-zoom-out"
            />
          </DialogPrimitive.Close>

          {/* Titre lu par les lecteurs d'écran, masqué à l'écran. */}
          <DialogPrimitive.Title className="sr-only">
            {alt || "Image agrandie"}
          </DialogPrimitive.Title>
          <div
            className={cn(
              "relative z-10 flex max-h-[86vh] max-w-[94vw] items-center justify-center overflow-auto rounded-lg",
              actualSize ? "cursor-grab" : "cursor-zoom-out",
            )}
            onClick={() => (actualSize ? undefined : onOpenChange(false))}
            role="presentation"
          >
            <img
              src={src}
              alt={alt}
              onLoad={(e) => {
                const el = e.currentTarget;
                if (el.naturalWidth) setNatural({ w: el.naturalWidth, h: el.naturalHeight });
              }}
              style={actualSize && natural ? { width: natural.w, height: natural.h } : undefined}
              className={cn(
                "rounded-lg bg-background object-contain shadow-2xl",
                actualSize ? "max-w-none" : "max-h-[86vh] max-w-[94vw]",
              )}
            />
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 text-sm text-white/80">
            {natural && (
              <span className="tabular-nums">
                {natural.w} × {natural.h} px
                {actualSize ? " · taille réelle" : ""}
              </span>
            )}
            {natural && natural.w > 0 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setActualSize((v) => !v)}
              >
                {actualSize ? <Minimize2 className="mr-1 h-4 w-4" /> : <Maximize2 className="mr-1 h-4 w-4" />}
                {actualSize ? "Ajuster à l'écran" : "Taille réelle"}
              </Button>
            )}
            {caption && <span className="max-w-[80vw] text-center">{caption}</span>}
          </div>

          <DialogPrimitive.Close asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Fermer"
              className="absolute right-4 top-4 z-20 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Lightbox;
