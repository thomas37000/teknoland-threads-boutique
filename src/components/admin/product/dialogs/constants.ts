/**
 * Constantes partagées par les dialogues d'administration des produits.
 * Centralisées ici pour éviter la duplication entre l'ajout et l'édition.
 */
export const CATEGORIES = [
  "T-shirts",
  "Sweats",
  "Vinyles",
  "Double Vinyles",
  "Stickers",
];

export const SIZE_OPTIONS = ["S", "M", "L", "XL"];

export const COLOR_OPTIONS = [
  "Noir",
  "Blanc",
  "Rouge",
  "Bleu",
  "Vert",
  "Jaune",
  "Rose",
  "Violet",
  "Orange",
  "Gris",
];

/** Catégories qui n'ont pas de variantes couleur/taille. */
export const CATEGORIES_WITHOUT_VARIATIONS = [
  "Vinyles",
  "Double Vinyles",
  "Stickers",
];

/** Catégories vinyles (simple / double). */
export const VINYL_CATEGORIES = ["Vinyles", "Double Vinyles"];

/** Catégories avec un stock simple (sans variantes ni pistes). */
export const SIMPLE_STOCK_CATEGORIES = ["Stickers"];

/** URL d'image placeholder utilisée lorsqu'aucune image n'est fournie. */
export const PLACEHOLDER_IMAGE_URL =
  "https://thwkmsuqkevfgqwlayqv.supabase.co/storage/v1/object/public/products/Placeholder_view_vector.svg.png";

/** Extensions audio acceptées pour les pistes vinyles. */
export const ALLOWED_AUDIO_EXTENSIONS = ["mp3", "wav", "flac", "aac", "aiff", "aif"];

/** Taille max des images (10 Mo) et de l'audio (50 Mo). */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024;

/** Nombre max d'images additionnelles par produit. */
export const MAX_ADDITIONAL_IMAGES = 4;