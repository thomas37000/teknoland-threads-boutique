/**
 * Tests E2E - Page d'accueil
 * ---------------------------
 * Vérifie le chargement, la navigation principale et les sections clés.
 */
describe("Page d'accueil", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("charge la page d'accueil", () => {
    cy.contains(/Tekno|Boutique|Shop/i, { timeout: 10000 }).should("exist");
  });

  it("affiche la barre de navigation", () => {
    cy.get("nav").should("be.visible");
  });

  it("affiche le footer", () => {
    cy.get("footer").should("exist");
  });

  it("permet de naviguer vers la boutique", () => {
    cy.get("a[href*='/shop']").first().click();
    cy.url().should("include", "/shop");
  });
});