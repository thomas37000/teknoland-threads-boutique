/**
 * Tests de la logique de filtrage / tri de l'onglet admin Discogs.
 * ---------------------------------------------------------------
 * Teste directement filterAndSortReleases() (src/components/admin/discogs/discogsFilters.ts)
 * : aucune requête réseau ni composant à monter, donc le test est rapide et stable.
 *
 * Données de test :
 *  - Tribe du Nord : stock 4   (relié à Airtable)
 *  - Static        : stock 7   (relié à Airtable)
 *  - Koh-Lanta     : stock 0   (relié, rupture)
 *  - Unknown       : stock inconnu (vinyle non relié à la release)
 *
 * Règles couvertes :
 *  - "En stock" = quantité > 0 ; "Rupture" = quantité = 0
 *  - un stock inconnu n'apparaît que dans "Tous les stocks"
 *  - un stock inconnu reste toujours en dernier quand on trie par stock
 *  - sans tri stock, l'ordre par défaut (collection décroissante) est conservé
 */
import {
  filterAndSortReleases,
  type DiscogsFilterOptions,
} from "@/components/admin/discogs/discogsFilters";
import type { DiscogsRelease } from "@/hooks/useDiscogs";

const makeRelease = (over: Partial<DiscogsRelease> = {}): DiscogsRelease => ({
  id: "uuid-1",
  release_id: 101,
  title: "Tribe du Nord",
  artist: "Teknoland",
  year: 2024,
  thumbnail: null,
  discogs_url: "https://www.discogs.com/release/101",
  current_collection_count: 12,
  current_wantlist_count: 8,
  num_for_sale: 4,
  lowest_price: 14.5,
  last_synced_at: null,
  ...over,
});

const releases = [
  makeRelease(),
  makeRelease({ id: "uuid-2", release_id: 102, title: "Koh-Lanta", year: 2023, current_collection_count: 5, current_wantlist_count: 3, num_for_sale: 1 }),
  makeRelease({ id: "uuid-3", release_id: 103, title: "Static", year: 2025, current_collection_count: 9, current_wantlist_count: 2, num_for_sale: 0 }),
  makeRelease({ id: "uuid-4", release_id: 104, title: "Unknown", year: 2022, current_collection_count: 1, current_wantlist_count: 1, num_for_sale: 2 }),
];

/** Stock Airtable simulé : Unknown (104) n'est relié à aucun vinyle. */
const stockByRelease = { 101: 4, 102: 0, 103: 7 };

/** Exécute le filtre avec les valeurs par défaut de l'onglet, puis les surcharges. */
const run = (over: Partial<DiscogsFilterOptions> = {}) =>
  filterAndSortReleases({
    releases,
    deltas: {},
    stockByRelease,
    search: "",
    collectionSort: "desc",
    wantlistSort: "desc",
    forSaleSort: null,
    stockSort: null,
    stockFilter: "all",
    ...over,
  });

const titles = (list: DiscogsRelease[]) => list.map((r) => r.title);

describe("Filtre et tri par stock (onglet Discogs)", () => {
  it("« En stock » ne garde que les quantités strictement positives", () => {
    const res = run({ stockFilter: "in" });
    expect(titles(res).sort()).to.deep.equal(["Static", "Tribe du Nord"]);
  });

  it("« Rupture de stock » ne garde que les quantités à 0", () => {
    expect(titles(run({ stockFilter: "out" }))).to.deep.equal(["Koh-Lanta"]);
  });

  it("« Tous les stocks » garde tout, y compris le vinyle non relié", () => {
    expect(titles(run({ stockFilter: "all" })).sort()).to.deep.equal(
      ["Koh-Lanta", "Static", "Tribe du Nord", "Unknown"],
    );
  });

  it("tri stock descendant : les grosses quantités d'abord, l'inconnu en dernier", () => {
    expect(titles(run({ stockSort: "desc" }))).to.deep.equal([
      "Static",
      "Tribe du Nord",
      "Koh-Lanta",
      "Unknown",
    ]);
  });

  it("tri stock ascendant : les faibles quantités d'abord, l'inconnu en dernier", () => {
    expect(titles(run({ stockSort: "asc" }))).to.deep.equal([
      "Koh-Lanta",
      "Tribe du Nord",
      "Static",
      "Unknown",
    ]);
  });

  it("le filtre stock se combine avec la recherche texte", () => {
    expect(titles(run({ search: "tri", stockFilter: "in" }))).to.deep.equal(["Tribe du Nord"]);
    expect(titles(run({ search: "tri", stockFilter: "out" }))).to.deep.equal([]);
  });

  it("sans tri stock, l'ordre par défaut reste collection décroissante", () => {
    expect(titles(run())).to.deep.equal(["Tribe du Nord", "Static", "Koh-Lanta", "Unknown"]);
  });
});
