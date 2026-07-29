/** Types internes aux dialogues produit. */
export interface ProductVariation {
  color: string;
  size: string;
  stock: number;
  /** URL de l'image de la variation (optionnelle). */
  image?: string;
}

export interface VinylTrack {
  id: string;
  name: string;
  /** Format `MM:SS`. */
  duration: string;
  artist: string;
  year: string;
  /** URL du fichier audio uploadé (mp3, wav, flac, aac, aiff). */
  audioUrl?: string;
}