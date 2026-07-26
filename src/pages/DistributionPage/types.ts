/**
 * Types partagés pour la page Distribution.
 *
 * - `Artiste` représente une ligne de la table Airtable « Artistes ». Les
 *   vinyles référencent des artistes via des record IDs (`rec...`).
 * - `VinyleFields` / `VinyleRecord` modélisent une ligne de la table
 *   Airtable « Vinyles » telle que renvoyée par l'edge function
 *   `airtable-proxy`.
 */
export interface Artiste {
  id: string; // Airtable record ID (rec...)
  fields: {
    Name?: string;
    [k: string]: any;
  };
}

export interface VinyleFields {
  Ref?: string;
  Titre?: string;
  Stock?: number | string;
  Date_de_sortie?: string;
  Image?: Array<{ url: string; thumbnails?: { small?: { url: string } } }> | string;
  Prix_distributeur?: number;
  Format?: string;
  Styles?: string[] | string;
  /** Tableau de record IDs Airtable pointant vers la table Artistes. */
  Artistes?: string[] | string;
  Label?: string;
  Discogs_url?: string;
  Quantité_Stock?: number;
  Echange?: boolean | number | string;
  [k: string]: any;
}

export interface VinyleRecord {
  id: string;
  fields: VinyleFields;
}

/** Valeur par défaut du formulaire d'ajout/édition d'un vinyle. */
export const EMPTY_VINYLE: VinyleFields = {
  Ref: "",
  Titre: "",
  Stock: 0,
  Date_de_sortie: "",
  Prix_distributeur: 0,
  Format: "",
  Styles: "",
  Artistes: [],
  Label: "",
  Discogs_url: "",
};

export type PriceSort = "none" | "asc" | "desc";

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}