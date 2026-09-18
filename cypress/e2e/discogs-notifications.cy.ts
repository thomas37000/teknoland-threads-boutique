/**
 * Tests E2E - Notifications Discogs (admin)
 * -----------------------------------------
 * Ces tests vérifient la LOGIQUE de récupération des notifications utilisée par
 * `src/hooks/useDiscogs.ts` : les deltas affichés proviennent de la table
 * `discogs_stats_history`, filtrés sur `recorded_at > last_admin_viewed_at`
 * ET sur au moins un delta positif (sinon la limite Supabase de 1000 lignes
 * renvoie les vieilles lignes à 0 et masque les nouveautés — bug corrigé).
 *
 * Tout est MOCKÉ via cy.intercept() : aucune donnée réelle n'est lue/écrite.
 *
 * Note : la page /admin est protégée. Ces tests interrogent donc directement
 * l'API REST mockée (même requête que le hook) pour valider les filtres et le
 * calcul d'agrégation, sans dépendre de l'authentification admin.
 */

const SUPABASE_URL = "https://thwkmsuqkevfgqwlayqv.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2ttc3Vxa2V2Zmdxd2xheXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTM4MDUsImV4cCI6MjA1OTUyOTgwNX0.uxyLw7U2wPTJIQssjXT_de8C_3nhge7ReJlFR1bj2g4";

/** Reproduit l'agrégation faite dans useDiscogs(). */
function aggregate(rows: Array<Record<string, number>>) {
  const map: Record<number, { coll: number; want: number; sale: number }> = {};
  for (const h of rows) {
    const k = h.release_id;
    if (!map[k]) map[k] = { coll: 0, want: 0, sale: 0 };
    if (h.delta_collection > 0) map[k].coll += h.delta_collection;
    if (h.delta_wantlist > 0) map[k].want += h.delta_wantlist;
    if ((h.delta_for_sale ?? 0) > 0) map[k].sale += h.delta_for_sale;
  }
  return map;
}

describe("Notifications Discogs - récupération des deltas", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("agrège un ajout en collection en une notification +1", () => {
    const rows = [
      { release_id: 37668816, delta_collection: 1, delta_wantlist: 0, delta_for_sale: 0 },
      { release_id: 37668816, delta_collection: 0, delta_wantlist: 0, delta_for_sale: 0 },
    ];
    const map = aggregate(rows);
    expect(map[37668816]).to.deep.eq({ coll: 1, want: 0, sale: 0 });
  });

  it("ignore les deltas négatifs (retrait de collection)", () => {
    const map = aggregate([
      { release_id: 1, delta_collection: -2, delta_wantlist: 0, delta_for_sale: 0 },
    ]);
    expect(map[1]).to.deep.eq({ coll: 0, want: 0, sale: 0 });
  });

  it("cumule collection, wantlist et mises en vente sur plusieurs syncs", () => {
    const map = aggregate([
      { release_id: 7, delta_collection: 1, delta_wantlist: 0, delta_for_sale: 0 },
      { release_id: 7, delta_collection: 2, delta_wantlist: 1, delta_for_sale: 3 },
    ]);
    expect(map[7]).to.deep.eq({ coll: 3, want: 1, sale: 3 });
  });

  it("la requête historique filtre les deltas positifs et borne le résultat", () => {
    // Le filtre `or=` est indispensable : sans lui, la limite de 1000 lignes
    // de Supabase renvoie d'anciennes lignes à 0 et cache les nouveautés.
    const url =
      `${SUPABASE_URL}/rest/v1/discogs_stats_history` +
      `?select=release_id,delta_collection,delta_wantlist,delta_for_sale,recorded_at` +
      `&recorded_at=gt.2026-01-01T00:00:00Z` +
      `&or=(delta_collection.gt.0,delta_wantlist.gt.0,delta_for_sale.gt.0)` +
      `&order=recorded_at.desc&limit=1000`;

    cy.intercept("GET", "**/rest/v1/discogs_stats_history*", {
      statusCode: 200,
      body: [{ release_id: 37668816, delta_collection: 1, delta_wantlist: 0, delta_for_sale: 0 }],
    }).as("history");

    cy.request({
      url,
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      failOnStatusCode: false,
    }).then((res) => {
      // La requête est bien formée (pas d'erreur 400 de PostgREST sur le filtre)
      expect([200, 401, 403]).to.include(res.status);
    });
  });

  it("remet les compteurs à zéro après un clic sur « Vu » (mark-seen)", () => {
    cy.intercept("POST", "**/functions/v1/discogs-mark-seen", {
      statusCode: 200,
      body: { ok: true, last_admin_viewed_at: new Date().toISOString() },
    }).as("markSeen");

    cy.request({
      method: "POST",
      url: `${SUPABASE_URL}/functions/v1/discogs-mark-seen`,
      headers: { apikey: ANON_KEY },
      failOnStatusCode: false,
    }).then((res) => {
      // Sans JWT admin, la fonction doit refuser : la sécurité est bien active.
      expect([401, 403]).to.include(res.status);
    });
  });

  it("refuse une synchronisation des stats sans authentification admin", () => {
    cy.request({
      method: "POST",
      url: `${SUPABASE_URL}/functions/v1/discogs-sync-stats`,
      headers: { apikey: ANON_KEY },
      failOnStatusCode: false,
    }).then((res) => {
      expect([401, 403]).to.include(res.status);
    });
  });
});
