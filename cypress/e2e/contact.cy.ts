/**
 * Tests E2E - Formulaire de contact
 * ---------------------------------
 * Vérifie le rendu, la validation HTML5, l'envoi via Supabase
 * (insertion dans `contacts` + Edge Function `send-contact-notification`),
 * et la gestion des erreurs.
 *
 * Toutes les requêtes Supabase sont MOCKÉES via cy.intercept() — aucune
 * donnée n'est insérée en base de données réelle.
 *
 * Référence code source : src/pages/ContactPage.tsx
 */
describe("Formulaire de contact (/contact)", () => {
  beforeEach(() => {
    cy.visit("/contact");
  });

  // ---------------------------------------------------------------------------
  // Affichage
  // ---------------------------------------------------------------------------
  it("affiche tous les champs du formulaire", () => {
    cy.get("input#name").should("be.visible");
    cy.get("input#email").should("be.visible").and("have.attr", "type", "email");
    cy.get("select#subject").should("be.visible");
    cy.get("textarea#message").should("be.visible");
    cy.get("button[type='submit']").should("be.visible");
  });

  it("affiche les 5 options du sujet + le placeholder", () => {
    // 5 vrais sujets + 1 option "placeholder" vide = 6 <option>
    cy.get("select#subject option").should("have.length", 6);
    cy.get("select#subject option[value='order']").should("exist");
    cy.get("select#subject option[value='product']").should("exist");
    cy.get("select#subject option[value='return']").should("exist");
    cy.get("select#subject option[value='feedback']").should("exist");
    cy.get("select#subject option[value='other']").should("exist");
  });

  it("affiche les coordonnées et les liens sociaux", () => {
    cy.contains("teknolandproduction@gmail.com").should("be.visible");
    cy.get("a[href*='facebook.com/teknolandProd']").should("exist");
    cy.get("a[href*='instagram.com/teknolandproduction']").should("exist");
    cy.get("a[href*='soundcloud.com/teknolandproduction']").should("exist");
    cy.get("a[href*='bandcamp.com']").should("exist");
  });

  // ---------------------------------------------------------------------------
  // Validation HTML5
  // ---------------------------------------------------------------------------
  it("empêche l'envoi si les champs requis sont vides (validation HTML5)", () => {
    // On intercepte pour garantir qu'aucun appel ne part
    cy.intercept("POST", "**/rest/v1/contacts*", cy.spy().as("dbInsert"));
    cy.get("button[type='submit']").click();
    // Le navigateur bloque la soumission, l'URL ne change pas
    cy.url().should("include", "/contact");
    cy.get("@dbInsert").should("not.have.been.called");
  });

  it("rejette une adresse email invalide", () => {
    cy.get("input#name").type("Jean Dupont");
    cy.get("input#email").type("pas-un-email");
    cy.get("select#subject").select("order");
    cy.get("textarea#message").type("Bonjour, ceci est un test.");

    cy.get("input#email").then(($el) => {
      const input = $el[0] as HTMLInputElement;
      // L'API native du navigateur indique l'invalidité
      expect(input.checkValidity()).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Soumission réussie
  // ---------------------------------------------------------------------------
  it("envoie le formulaire avec succès et affiche la bannière de confirmation", () => {
    // 1. Mock de l'INSERT Supabase dans la table `contacts`
    cy.intercept("POST", "**/rest/v1/contacts*", {
      statusCode: 201,
      body: [{ id: "fake-contact-id" }],
      headers: { "content-type": "application/json" },
    }).as("contactInsert");

    // 2. Mock de l'Edge Function `send-contact-notification`
    cy.intercept("POST", "**/functions/v1/send-contact-notification", {
      statusCode: 200,
      body: { success: true },
    }).as("contactNotification");

    // 3. Remplissage
    cy.get("input#name").type("Marie Curie");
    cy.get("input#email").type("marie@example.com");
    cy.get("select#subject").select("product");
    cy.get("textarea#message").type("Question sur un vinyle, merci !");

    // 4. Envoi
    cy.get("button[type='submit']").click();

    // 5. Vérification de l'appel BD avec les bonnes données
    cy.wait("@contactInsert").then(({ request }) => {
      const payload = Array.isArray(request.body) ? request.body[0] : request.body;
      expect(payload.name).to.eq("Marie Curie");
      expect(payload.email).to.eq("marie@example.com");
      expect(payload.subject).to.eq("product");
      expect(payload.message).to.eq("Question sur un vinyle, merci !");
    });

    // 6. Vérification de l'appel Edge Function (notification email)
    cy.wait("@contactNotification").then(({ request }) => {
      expect(request.body).to.deep.include({
        name: "Marie Curie",
        email: "marie@example.com",
        subject: "product",
      });
    });

    // 7. Bannière de succès visible (CheckCircle2 + message)
    cy.contains(/merci|envoy|success|reçu/i, { timeout: 6000 }).should("be.visible");

    // 8. Reset du formulaire
    cy.get("input#name").should("have.value", "");
    cy.get("input#email").should("have.value", "");
    cy.get("textarea#message").should("have.value", "");
  });

  it("permet de fermer la bannière de succès", () => {
    cy.intercept("POST", "**/rest/v1/contacts*", { statusCode: 201, body: [{}] });
    cy.intercept("POST", "**/functions/v1/send-contact-notification", {
      statusCode: 200,
      body: { success: true },
    });

    cy.get("input#name").type("Test User");
    cy.get("input#email").type("test@test.fr");
    cy.get("select#subject").select("feedback");
    cy.get("textarea#message").type("Super site !");
    cy.get("button[type='submit']").click();

    cy.get("button[aria-label='Fermer']", { timeout: 6000 })
      .should("be.visible")
      .click();
    cy.get("button[aria-label='Fermer']").should("not.exist");
  });

  // ---------------------------------------------------------------------------
  // Gestion d'erreur
  // ---------------------------------------------------------------------------
  it("affiche une erreur si l'insertion BD échoue", () => {
    cy.intercept("POST", "**/rest/v1/contacts*", {
      statusCode: 500,
      body: { message: "Database error" },
    }).as("contactInsertFail");

    cy.get("input#name").type("Erreur Test");
    cy.get("input#email").type("err@test.fr");
    cy.get("select#subject").select("other");
    cy.get("textarea#message").type("Test d'erreur serveur");
    cy.get("button[type='submit']").click();

    cy.wait("@contactInsertFail");

    // Toast d'erreur (sonner)
    cy.contains(/erreur|error|échou/i, { timeout: 6000 }).should("be.visible");

    // Le formulaire NE doit PAS être réinitialisé en cas d'erreur
    cy.get("input#name").should("have.value", "Erreur Test");
  });

  it("considère le succès même si l'email de notification échoue (non-bloquant)", () => {
    // L'insertion BD réussit
    cy.intercept("POST", "**/rest/v1/contacts*", {
      statusCode: 201,
      body: [{ id: "ok" }],
    }).as("contactInsert");
    // Mais l'Edge Function email échoue
    cy.intercept("POST", "**/functions/v1/send-contact-notification", {
      statusCode: 500,
      body: { error: "Email service down" },
    }).as("emailFail");

    cy.get("input#name").type("Tolerant Test");
    cy.get("input#email").type("tol@test.fr");
    cy.get("select#subject").select("order");
    cy.get("textarea#message").type("L'email peut échouer, ce n'est pas grave.");
    cy.get("button[type='submit']").click();

    cy.wait("@contactInsert");
    cy.wait("@emailFail");

    // L'utilisateur voit quand même la bannière de succès
    cy.contains(/merci|envoy|success|reçu/i, { timeout: 6000 }).should("be.visible");
  });

  // ---------------------------------------------------------------------------
  // UX
  // ---------------------------------------------------------------------------
  it("désactive le bouton pendant l'envoi", () => {
    // Insert qui prend du temps (delay 1500ms)
    cy.intercept("POST", "**/rest/v1/contacts*", (req) => {
      req.reply({ delay: 1500, statusCode: 201, body: [{}] });
    });
    cy.intercept("POST", "**/functions/v1/send-contact-notification", {
      statusCode: 200,
      body: { success: true },
    });

    cy.get("input#name").type("Slow User");
    cy.get("input#email").type("slow@test.fr");
    cy.get("select#subject").select("order");
    cy.get("textarea#message").type("Test du loading state");

    cy.get("button[type='submit']").click();
    cy.get("button[type='submit']").should("be.disabled");
    cy.get("button[type='submit']").should("contain.text", "Envoi");
  });
});