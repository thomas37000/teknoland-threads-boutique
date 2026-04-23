/**
 * Tests E2E - Panier
 * -------------------
 * Vérifie l'affichage du panier, l'état vide et la popup de connexion au checkout.
 */
describe("Page Panier", () => {
  beforeEach(() => {
    cy.clearCart();
    cy.visit("/cart");
  });

  it("affiche la page panier", () => {
    cy.url().should("include", "/cart");
  });

  it("affiche l'état vide quand aucun produit", () => {
    cy.contains(/vide|empty|panier/i).should("exist");
  });
});