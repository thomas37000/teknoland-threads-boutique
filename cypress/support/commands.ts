/// <reference types="cypress" />

/**
 * Commandes personnalisées Cypress
 * ---------------------------------
 * Ajoute des helpers réutilisables accessibles via cy.xxx() dans tes tests.
 * Documentation officielle : https://docs.cypress.io/api/cypress-api/custom-commands
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Sélectionne un élément via l'attribut data-testid (recommandé).
       * Exemple : cy.getByTestId("login-button")
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Simule la connexion d'un utilisateur en posant une session Supabase factice
       * dans le localStorage. À adapter selon vos besoins réels d'authentification.
       */
      loginAsMockUser(email?: string): Chainable<void>;

      /**
       * Vide le panier dans le localStorage.
       */
      clearCart(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add("loginAsMockUser", (email = "test@example.com") => {
  cy.window().then((win) => {
    win.localStorage.setItem(
      "sb-mock-auth-token",
      JSON.stringify({
        currentSession: {
          user: { id: "mock-user-id", email },
          access_token: "mock-token",
        },
      }),
    );
  });
});

Cypress.Commands.add("clearCart", () => {
  cy.window().then((win) => {
    win.localStorage.removeItem("cart");
    win.localStorage.removeItem("favorites");
  });
});

export {};