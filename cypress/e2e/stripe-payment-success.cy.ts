/**
 * Tests E2E - Page de succès Stripe
 * ---------------------------------
 * Stripe redirige vers `/payment-success?session_id=...` après un paiement réussi.
 * On vérifie que la page :
 *  - vide le panier
 *  - affiche un message de confirmation
 *  - propose de continuer les achats ou voir les commandes
 */
describe("Page de succès Stripe (/payment-success)", () => {
  beforeEach(() => {
    // On simule un panier non-vide AVANT d'arriver sur la page success,
    // pour vérifier qu'il sera bien vidé automatiquement.
    cy.seedCart();
  });

  it("affiche le message de confirmation avec un session_id", () => {
    cy.visit("/payment-success?session_id=cs_test_mocked_123");

    // Le composant PaymentSuccessPage affiche un loader 2s puis le message.
    cy.contains(/merci|success|paiement|confirmé/i, { timeout: 8000 })
      .should("be.visible");
  });

  it("vide le panier après un paiement réussi", () => {
    cy.visit("/payment-success?session_id=cs_test_mocked_123");

    // Attendre que l'effet React clearCart() ait tourné
    cy.wait(2500);

    cy.window().then((win) => {
      const cart = win.localStorage.getItem("teknoland-cart");
      // Soit la clé est absente, soit elle vaut un tableau vide
      const parsed = cart ? JSON.parse(cart) : [];
      expect(parsed).to.have.length(0);
    });
  });

  it("propose de continuer les achats", () => {
    cy.visit("/payment-success?session_id=cs_test_mocked_123");
    cy.contains(/continuer|shop|boutique/i, { timeout: 8000 })
      .should("be.visible")
      .click();
    cy.url().should("include", "/shop");
  });
});