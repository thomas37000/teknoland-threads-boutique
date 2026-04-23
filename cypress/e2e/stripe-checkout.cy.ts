/**
 * Tests E2E - Checkout Stripe (panier complet)
 * --------------------------------------------
 * Vérifie le parcours de paiement depuis la page panier :
 *  1. Un utilisateur non connecté voit la popup de connexion.
 *  2. Un utilisateur connecté est redirigé vers Stripe Checkout (mocké).
 *  3. Les erreurs renvoyées par l'Edge Function sont gérées proprement.
 *
 * Toutes les requêtes vers `create-cart-checkout` sont interceptées via
 * `cy.mockStripeCheckout()` — aucune vraie session Stripe n'est créée.
 */
describe("Checkout Stripe — depuis le panier", () => {
  beforeEach(() => {
    cy.clearCart();
    cy.seedCart();

    // Empêche la vraie redirection vers checkout.stripe.com lors du test :
    // on remplace `window.location.href = ...` par un stub espionnable.
    cy.on("window:before:load", (win) => {
      let href = win.location.href;
      Object.defineProperty(win.location, "href", {
        get: () => href,
        set: (value: string) => {
          href = value;
          // On stocke la valeur pour pouvoir l'inspecter ensuite.
          (win as unknown as { __redirectedTo?: string }).__redirectedTo = value;
        },
      });
    });
  });

  it("affiche la popup de connexion si l'utilisateur n'est pas authentifié", () => {
    cy.mockStripeCheckout();
    cy.visit("/cart");

    cy.contains("Vinyle Test Cypress").should("be.visible");
    cy.contains(/passer commande|checkout|valider/i).click();

    // Popup AlertDialog (cf. mem://features/popup-connexion-panier)
    cy.get("[role='alertdialog']").should("be.visible");
    cy.contains(/connect|sign in|login/i).should("exist");

    // L'Edge Function NE doit PAS être appelée tant que l'user n'est pas loggué
    cy.get("@stripeCheckout.all").should("have.length", 0);
  });

  it("appelle l'Edge Function et redirige vers Stripe quand l'user est connecté", () => {
    cy.loginAsMockUser("buyer@test.fr");
    cy.mockStripeCheckout();
    cy.visit("/cart");

    cy.contains(/passer commande|checkout|valider/i).click();

    cy.wait("@stripeCheckout").then((interception) => {
      // Le body envoyé doit contenir cartItems et metadata.user_id
      expect(interception.request.body).to.have.property("cartItems");
      expect(interception.request.body.cartItems).to.be.an("array");
      expect(interception.request.body).to.have.nested.property(
        "metadata.user_id",
      );
    });

    // Vérifie que la redirection a bien été déclenchée vers l'URL mockée
    cy.window()
      .its("__redirectedTo", { timeout: 5000 })
      .should("include", "checkout.stripe.com");
  });

  it("affiche une erreur si l'Edge Function échoue (500)", () => {
    cy.loginAsMockUser("buyer@test.fr");
    cy.mockStripeCheckout("stripeCheckout", 500);
    cy.visit("/cart");

    cy.contains(/passer commande|checkout|valider/i).click();

    cy.wait("@stripeCheckout");
    // Toast d'erreur (sonner) ou message visible
    cy.contains(/erreur|error|échou/i, { timeout: 6000 }).should("be.visible");

    // L'utilisateur doit toujours être sur /cart, pas redirigé
    cy.url().should("include", "/cart");
  });

  it("désactive le bouton checkout quand le panier est vide", () => {
    cy.clearCart();
    cy.visit("/cart");
    cy.contains(/passer commande|checkout|valider/i).should("not.exist");
  });
});