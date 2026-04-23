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

      /**
       * Pré-remplit le panier (localStorage) avec un ou plusieurs articles
       * pour tester le checkout sans devoir naviguer dans toute la boutique.
       */
      seedCart(items?: unknown[]): Chainable<void>;

      /**
       * Intercepte l'appel à l'Edge Function Supabase `create-cart-checkout`
       * et renvoie une URL Stripe factice (fixture cypress/fixtures/stripe-checkout.json).
       * Alias par défaut : `@stripeCheckout`.
       */
      mockStripeCheckout(alias?: string, statusCode?: number): Chainable<void>;

      /**
       * Intercepte l'appel à `create-checkout` (achat unitaire "Acheter maintenant").
       * Alias par défaut : `@stripeSingleCheckout`.
       */
      mockStripeSingleCheckout(alias?: string, statusCode?: number): Chainable<void>;
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
    win.localStorage.removeItem("teknoland-cart");
    win.localStorage.removeItem("favorites");
  });
});

/**
 * Pose un panier complet dans le localStorage avant la navigation.
 * La clé `teknoland-cart` correspond à `CART_STORAGE_KEY` dans
 * `src/utils/cart-storage.ts` — toute modification doit rester synchronisée.
 */
Cypress.Commands.add("seedCart", (items?: unknown[]) => {
  const defaultItems = [
    {
      id: "test-product-1",
      name: "Vinyle Test Cypress",
      price: 25,
      image: "https://thwkmsuqkevfgqwlayqv.supabase.co/storage/v1/object/public/placeholder/no-image.png",
      quantity: 1,
    },
  ];
  const cart = items ?? defaultItems;
  cy.window().then((win) => {
    win.localStorage.setItem("teknoland-cart", JSON.stringify(cart));
  });
});

/**
 * Intercepte l'invocation de l'Edge Function `create-cart-checkout`
 * (déclenchée depuis `src/utils/cart-checkout.ts`). Supabase utilise
 * un POST vers `/functions/v1/<nom>` — on matche donc sur ce chemin.
 */
Cypress.Commands.add(
  "mockStripeCheckout",
  (alias = "stripeCheckout", statusCode = 200) => {
    cy.intercept("POST", "**/functions/v1/create-cart-checkout", {
      statusCode,
      fixture: statusCode === 200 ? "stripe-checkout.json" : undefined,
      body: statusCode !== 200 ? { error: "Mocked Stripe error" } : undefined,
    }).as(alias);
  },
);

/**
 * Intercepte l'invocation de l'Edge Function `create-checkout`
 * (déclenchée depuis `src/utils/stripe.ts` — bouton "Acheter maintenant").
 */
Cypress.Commands.add(
  "mockStripeSingleCheckout",
  (alias = "stripeSingleCheckout", statusCode = 200) => {
    cy.intercept("POST", "**/functions/v1/create-checkout", {
      statusCode,
      fixture: statusCode === 200 ? "stripe-checkout.json" : undefined,
      body: statusCode !== 200 ? { error: "Mocked Stripe error" } : undefined,
    }).as(alias);
  },
);

export {};