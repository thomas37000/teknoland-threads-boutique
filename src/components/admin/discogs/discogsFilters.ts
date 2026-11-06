/**
 * Logique de filtrage / tri de l'onglet admin Discogs.
 * ---------------------------------------------------
 * Séparée de DiscogsManagement.tsx pour pouvoir être testée sans monter le
 * composant (voir cypress/component/DiscogsStockFilter.cy.ts).
 *
 * Ordre appliqué :
 *  1. recherche texte (titre ou artiste)
 *  2. filtre stock (quantité Airtable « Quantité_Stock »)
 *  3. tris, du plus prioritaire au moins prioritaire :
 *     stock → exemplaires en vente → collection → wantlist → deltas → année
 */
import type { DiscogsRelease } from "@/hooks/useDiscogs";

/** Direction de tri ; `null` = tri désactivé. */
export type SortDir = "asc" | "desc" | null;

/**
 * Filtre sur le stock Airtable :
 *  - "all" : tout afficher
 *  - "in"  : seulement les vinyles dont la quantité est strictement positive
 *  - "out" : seulement les vinyles dont la quantité est exactement 0
 * Un vinyle non relié à la release (stock inconnu) n'apparaît que dans "all".
 */
export type StockFilter = "all" | "in" | "out";

export interface DiscogsFilterOptions {
  releases: DiscogsRelease[];
  /** Deltas non vus, agrégés par release_id (collection / wantlist / vente). */
  deltas: Record<number, { coll: number; want: number; sale: number }>;
  /** Quantité Airtable par release_id ; clé absente = stock inconnu. */
  stockByRelease: Record<number, number>;
  search: string;
  collectionSort: SortDir;
  wantlistSort: SortDir;
  forSaleSort: SortDir;
  stockSort: SortDir;
  stockFilter: StockFilter;
}

/** Applique la direction de tri à un écart `a - b`. */
const byDir = (diff: number, dir: "asc" | "desc") => (dir === "asc" ? diff : -diff);

export function filterAndSortReleases({
  releases,
  deltas,
  stockByRelease,
  search,
  collectionSort,
  wantlistSort,
  forSaleSort,
  stockSort,
  stockFilter,
}: DiscogsFilterOptions): DiscogsRelease[] {
  const q = search.trim().toLowerCase();

  // 1. Recherche texte
  let list = q
    ? releases.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.artist ?? "").toLowerCase().includes(q),
      )
    : releases;

  // 2. Filtre stock
  if (stockFilter !== "all") {
    list = list.filter((r) => {
      const s = stockByRelease[r.release_id];
      if (s == null) return false; // stock inconnu : visible seulement dans "all"
      return stockFilter === "in" ? s > 0 : s === 0;
    });
  }

  // 3. Tris
  return [...list].sort((a, b) => {
    // Stock : les stocks inconnus restent en dernier, quel que soit le sens
    if (stockSort) {
      const sa = stockByRelease[a.release_id];
      const sb = stockByRelease[b.release_id];
      if ((sa == null) !== (sb == null)) return sa == null ? 1 : -1;
      const diff = (sa ?? 0) - (sb ?? 0);
      if (diff !== 0) return byDir(diff, stockSort);
    }
    if (forSaleSort) {
      const diff = (a.num_for_sale ?? 0) - (b.num_for_sale ?? 0);
      if (diff !== 0) return byDir(diff, forSaleSort);
    }
    if (collectionSort) {
      const diff = a.current_collection_count - b.current_collection_count;
      if (diff !== 0) return byDir(diff, collectionSort);
    }
    if (wantlistSort) {
      const diff = a.current_wantlist_count - b.current_wantlist_count;
      if (diff !== 0) return byDir(diff, wantlistSort);
    }
    // Fallback : nouveautés non vues puis année décroissante
    const da = (deltas[a.release_id]?.coll ?? 0) + (deltas[a.release_id]?.want ?? 0);
    const db = (deltas[b.release_id]?.coll ?? 0) + (deltas[b.release_id]?.want ?? 0);
    if (db !== da) return db - da;
    return (b.year ?? 0) - (a.year ?? 0);
  });
}
