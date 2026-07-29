import type { VinylTrack } from "../types";

/**
 * Génère la liste par défaut des pistes pour un vinyle simple ou double.
 * - Vinyles: 4 pistes (A1, A2, B1, B2)
 * - Double Vinyles: 8 pistes (A1..D2)
 */
export const buildDefaultVinylTracks = (category: string | undefined): VinylTrack[] => {
  const emptyTrack = (id: string): VinylTrack => ({
    id,
    name: "",
    duration: "0:00",
    artist: "",
    year: "",
  });

  if (category === "Vinyles") {
    return ["A1", "A2", "B1", "B2"].map(emptyTrack);
  }
  if (category === "Double Vinyles") {
    return ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"].map(emptyTrack);
  }
  return [];
};