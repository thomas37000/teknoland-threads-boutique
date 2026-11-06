/**
 * Tests de composant - Filtre par stock dans l'onglet Discogs
 * -----------------------------------------------------------
 * Monte le vrai composant DiscogsManagement avec toutes les données
 * simulées par interception HTTP (aucun appel réseau réel).
 *
 * Stock Airtable simulé :
 *  - Tribe du Nord : 4      - Static : 7      - Koh-Lanta : 0 (rupture)
 *  - Unknown : vinyle non relié à la release -> stock inconnu (affiché « — »)
 *
 * Règles couvertes :
 *  - « En stock uniquement » masque la rupture et les stocks inconnus
 *  - « Rupture de stock » ne garde que la quantité 0
 *  - le tri « Plus de stock d'abord » ordonne les cartes et laisse l'inconnu en dernier
 */
import DiscogsManagement from "@/components/admin/DiscogsManagement";

const makeRelease = (over: any = {}) => ({
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
  makeRelease({ id: "uuid-2", release_id: 102, title: "Koh-Lanta", year: 2023, current_collection_count: 5, num_for_sale: 1 }),
  makeRelease({ id: "uuid-3", release_id: 103, title: "Static", year: 2025, current_collection_count: 9, num_for_sale: 0 }),
  makeRelease({ id: "uuid-4", release_id: 104, title: "Unknown", year: 2022, current_collection_count: 1, num_for_sale: 2 }),
];

/** Table Airtable « Vinyles » : Unknown (104) n'y figure pas. */
const vinyles = [
  { id: "v1", fields: { Discogs_url: "https://www.discogs.com/release/101", "Quantité_Stock": 4 } },
  { id: "v2", fields: { Discogs_url: "https://www.discogs.com/release/102", "Quantité_Stock": 0 } },
  { id: "v3", fields: { Discogs_url: "https://www.discogs.com/release/103", "Quantité_Stock": 7 } },
];

const openStockFilter = () => {
  cy.contains("button", "Tous les stocks").click();
};

describe("<DiscogsManagement /> - filtre par stock", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/rest/v1/discogs_releases*", { body: releases }).as("releases");
    cy.intercept("GET", "**/rest/v1/discogs_sync_state*", {
      body: {
        singleton: true,
        last_full_sync_at: null,
        last_stats_sync_at: null,
        unseen_collection_delta: 0,
        unseen_wantlist_delta: 0,
        unseen_for_sale_delta: 0,
        last_admin_viewed_at: "2026-01-01T00:00:00Z",
      },
    });
    cy.intercept("GET", "**/rest/v1/discogs_stats_history*", { body: [] });
    cy.intercept("POST", "**/functions/v1/airtable-proxy*", (req) => {
      const table = req.body?.table;
      req.reply({ body: { records: table === "Vinyles" ? vinyles : [] } });
    });
  });

  it("affiche les stocks Airtable sur les cartes et les deux contrôles de stock", () => {
    cy.mount(<DiscogsManagement />);
    cy.get("p.font-semibold.text-sm", { timeout: 8000 }).should("have.length", 4);
    cy.contains("Stock : 4").should("be.visible");
    cy.contains("Stock : 7").should("be.visible");
    cy.contains("Stock : 0").should("be.visible");
    cy.contains("Stock : —").should("be.visible");
    cy.contains("button", "Tous les stocks").should("be.visible");
    cy.contains("button", "Aucun tri").should("be.visible");
  });

  it("« En stock uniquement » masque la rupture et les stocks inconnus", () => {
    cy.mount(<DiscogsManagement />);
    cy.get("p.font-semibold.text-sm", { timeout: 8000 }).should("have.length", 4);
    openStockFilter();
    cy.contains('[role="option"]', "En stock uniquement").click();
    cy.get("p.font-semibold.text-sm").should("have.length", 2);
    cy.contains("Static").should("be.visible");
    cy.contains("Tribe du Nord").should("be.visible");
    cy.contains("Koh-Lanta").should("not.exist");
    cy.contains("Unknown").should("not.exist");
  });

  it("« Rupture de stock » ne garde que la quantité 0", () => {
    cy.mount(<DiscogsManagement />);
    cy.get("p.font-semibold.text-sm", { timeout: 8000 }).should("have.length", 4);
    openStockFilter();
    cy.contains('[role="option"]', "Rupture de stock").click();
    cy.get("p.font-semibold.text-sm").should("have.length", 1);
    cy.contains("Koh-Lanta").should("be.visible");
  });

  it("« Plus de stock d'abord » ordonne les cartes, l'inconnu en dernier", () => {
    cy.mount(<DiscogsManagement />);
    cy.get("p.font-semibold.text-sm", { timeout: 8000 }).should("have.length", 4);
    cy.get('[role="combobox"]').last().click();
    cy.contains('[role="option"]', "Plus de stock d'abord").click();
    cy.get("p.font-semibold.text-sm")
      .should("have.length", 4)
      .then(($els) => {
        const t = $els.toArray().map((e) => e.textContent?.trim());
        expect(t).to.deep.equal(["Static", "Tribe du Nord", "Koh-Lanta", "Unknown"]);
      });
  });
});
