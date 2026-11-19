import * as React from "react";
import { cn } from "@/lib/utils";
import { Lightbox } from "@/components/ui/lightbox";

/**
 * Rend cliquables toutes les images contenues dans `children`.
 * ------------------------------------------------------------
 * Un clic sur une image l'ouvre en grand (lightbox). Utile pour les articles
 * de blog : image de couverture, blocs image et images insérées dans du texte
 * enrichi sont traitées de la même façon, sans avoir à modifier chaque bloc.
 *
 * Les images qui se trouvent dans un lien ou un bouton ne sont pas interceptées
 * (le clic continue d'ouvrir le lien).
 */
export const ZoomableImages = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [current, setCurrent] = React.useState<{ src: string; alt: string } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    if (el.tagName !== "IMG") return;
    if (el.closest("a, button")) return;
    const img = el as HTMLImageElement;
    const src = img.getAttribute("src");
    if (!src) return;
    setCurrent({ src, alt: img.alt || "" });
  };

  return (
    <>
      <div className={cn("zoomable-images", className)} onClick={handleClick}>
        {children}
      </div>
      {/* La visionneuse est placée à côté du contenu cliquable : un clic à
          l'intérieur de la visionneuse ne doit pas la relancer. */}
      <Lightbox
        src={current?.src}
        alt={current?.alt ?? ""}
        open={!!current}
        onOpenChange={(open) => !open && setCurrent(null)}
      />
    </>
  );
};

export default ZoomableImages;
