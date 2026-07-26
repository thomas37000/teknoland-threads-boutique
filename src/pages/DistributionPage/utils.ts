import type { VinyleFields } from "./types";

/** Formate une valeur multi-select Airtable pour affichage (string ou string[]). */
export const formatList = (v: any): string => {
  if (!v) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
};

/**
 * Convertit une valeur linked-record Airtable en tableau d'IDs. Accepte les
 * chaînes séparées par des virgules et filtre les valeurs vides.
 */
export const toIdArray = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

/** Retourne l'URL de la première image (thumbnail small si dispo). */
export const firstImage = (img: VinyleFields["Image"]): string | null => {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (Array.isArray(img) && img.length > 0) {
    return img[0]?.thumbnails?.small?.url || img[0]?.url || null;
  }
  return null;
};

/**
 * Classe Tailwind du badge de stock selon la quantité disponible.
 * < 50 gris • ≥ 50 vert • ≥ 100 jaune • ≥ 200 bleu.
 */
export const getStockBadgeClass = (stock: number): string => {
  if (stock >= 200) return "bg-blue-500 text-white hover:bg-blue-500";
  if (stock >= 100) return "bg-yellow-500 text-black hover:bg-yellow-500";
  if (stock >= 50) return "bg-green-500 text-white hover:bg-green-500";
  return "bg-gray-400 text-white hover:bg-gray-400";
};