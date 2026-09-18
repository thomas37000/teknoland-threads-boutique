/**
 * Tests de composant - SoundCloudManagement (admin)
 * --------------------------------------------------
 * Composant testé : src/components/admin/SoundCloudManagement.tsx
 *
 * Principe : toutes les requêtes passent par `supabase.functions.invoke(...)`
 * (Edge Functions `airtable-proxy`, `soundcloud-sync`, `soundcloud-resolve`).
 * On remplace donc cette méthode par un stub Cypress : aucune donnée réelle
 * n'est lue ni écrite dans Airtable / SoundCloud.
 *
 * Règles métier couvertes :
 *  - seuls les artistes avec une URL SoundCloud sont listés
 *  - tri décroissant sur « Followers Delta »
 *  - recherche par nom (insensible à la casse)
 *  - le bouton « Sync Artistes » appelle `soundcloud-sync` et affiche les erreurs
 *  - l'ajout d'un artiste résout l'ID via `soundcloud-resolve` puis POST Airtable
 */
import SoundCloudManagement from "@/components/admin/SoundCloudManagement";
import { supabase } from "@/integrations/supabase/client";

/** Enregistrement Airtable factice. */
const artist = (
  id: string,
  Name: string,
  over: Record<string, unknown> = {},
) => ({
  id,
  fields: {
    Name,
    Soundcloud_url: `https://soundcloud.com/${Name.toLowerCase()}`,
    "Followers Count": 100,
    "Followers Delta": 0,
    "Last Sync": "2026-01-15T10:30:00.000Z",
    styles: ["Tekno"],
    ...over,
  },
});

const RECORDS = [
  artist("rec1", "Alpha", { "Followers Delta": 5 }),
  artist("rec2", "Beta", { "Followers Delta": 12, "Followers Count": 2500 }),
  // Sans URL SoundCloud : ne doit jamais apparaître dans le tableau
  { id: "rec3", fields: { Name: "SansUrl", "Followers Count": 9 } },
];

/**
 * Remplace supabase.functions.invoke par un stub qui répond selon le nom
 * de la fonction appelée. `overrides` permet de personnaliser une réponse.
 */
function stubInvoke(overrides: Record<string, unknown> = {}) {
  const responses: Record<string, unknown> = {
    "airtable-proxy": { data: { records: RECORDS }, error: null },
    "soundcloud-sync": {
      data: { updated: 2, skipped: 1, total: 3, errors: [] },
      error: null,
    },
    "soundcloud-resolve": {
      data: { id: 123456, username: "gamma", permalink_url: "https://soundcloud.com/gamma", followers_count: 42 },
      error: null,
    },
    ...overrides,
  };
  const stub = cy.stub().callsFake((name: string) => Promise.resolve(responses[name]));
  cy.stub(supabase.functions, "invoke").callsFake(stub);
  return stub;
}

describe("<SoundCloudManagement />", () => {
  it("liste uniquement les artistes ayant une URL SoundCloud", () => {
    stubInvoke();
    cy.mount(<SoundCloudManagement />);
    cy.contains("Alpha").should("be.visible");
    cy.contains("Beta").should("be.visible");
    cy.contains("SansUrl").should("not.exist");
  });

  it("trie les artistes par delta de followers décroissant", () => {
    stubInvoke();
    cy.mount(<SoundCloudManagement />);
    cy.get("tbody tr").first().should("contain.text", "Beta");
  });

  it("affiche les followers formatés et le badge de delta", () => {
    stubInvoke();
    cy.mount(<SoundCloudManagement />);
    cy.contains("tr", "Beta").within(() => {
      cy.contains("+12").should("be.visible");
    });
  });

  it("filtre les artistes via la recherche", () => {
    stubInvoke();
    cy.mount(<SoundCloudManagement />);
    cy.get("input[placeholder='Rechercher un artiste...']").type("alp");
    cy.contains("Alpha").should("be.visible");
    cy.contains("Beta").should("not.exist");
  });

  it("affiche un message quand aucun artiste ne correspond", () => {
    stubInvoke();
    cy.mount(<SoundCloudManagement />);
    cy.get("input[placeholder='Rechercher un artiste...']").type("zzz");
    cy.contains("Aucun artiste avec une URL SoundCloud.").should("be.visible");
  });

  it("déclenche la synchronisation SoundCloud au clic sur « Sync Artistes »", () => {
    const stub = stubInvoke();
    cy.mount(<SoundCloudManagement />);
    cy.contains("button", "Sync Artistes").click();
    cy.wrap(null).should(() => {
      expect(stub).to.have.been.calledWith("soundcloud-sync");
    });
  });

  it("affiche les erreurs renvoyées par la synchronisation", () => {
    stubInvoke({
      "soundcloud-sync": {
        data: { updated: 1, skipped: 1, total: 2, errors: ["Alpha: resolve 403"] },
        error: null,
      },
    });
    cy.mount(<SoundCloudManagement />);
    cy.contains("button", "Sync Artistes").click();
    cy.contains("La synchronisation a échoué pour certains artistes").should("be.visible");
    cy.contains("Alpha: resolve 403").should("be.visible");
    cy.contains("1 mis à jour · 1 ignorés · 2 au total").should("be.visible");
  });

  it("ouvre le formulaire d'ajout et crée un artiste (resolve + POST Airtable)", () => {
    const stub = stubInvoke();
    cy.mount(<SoundCloudManagement />);
    cy.contains("button", "Ajouter un artiste").click();
    cy.get("#sc-name").type("Gamma");
    cy.get("#sc-url").type("https://soundcloud.com/gamma");
    cy.contains("button", "Créer").click();

    cy.wrap(null).should(() => {
      expect(stub).to.have.been.calledWith("soundcloud-resolve");
      const post = stub
        .getCalls()
        .find((c) => c.args[0] === "airtable-proxy" && c.args[1]?.body?.method === "POST");
      expect(post, "POST Airtable envoyé").to.exist;
      expect(post!.args[1].body.fields).to.include({ Name: "Gamma", id: 123456 });
    });
    cy.contains("Ajouter un artiste").should("exist");
  });

  it("n'envoie rien si le nom est vide", () => {
    const stub = stubInvoke();
    cy.mount(<SoundCloudManagement />);
    cy.contains("button", "Ajouter un artiste").click();
    cy.contains("button", "Créer").click();
    cy.wrap(null).should(() => {
      const post = stub
        .getCalls()
        .find((c) => c.args[1]?.body?.method === "POST");
      expect(post, "aucun POST Airtable").to.not.exist;
    });
  });
});
