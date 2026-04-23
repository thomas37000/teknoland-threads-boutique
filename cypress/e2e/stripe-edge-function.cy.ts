/**
 * Tests E2E - Contrat de l'Edge Function `create-cart-checkout`
 * -------------------------------------------------------------
 * Ces tests vérifient que le frontend envoie bien la structure attendue
 * par l'Edge Function Supabase. Ils n'appellent pas la vraie fonction —
 * tout est mocké via cy.intercept(). Si tu changes le contrat côté
 * `supabase/functions/create-cart-checkout/index.ts`, mets à jour ces tests.
 *
 * Rappel sécurité (cf. mem://security/securite-flux-paiement) :
 *  - Le frontend ne doit JAMAIS envoyer le prix final.
 *  - Le serveur recalcule le prix depuis la base de données.
 *  - Un JWT valide est obligatoire (Authorization: Bearer ...).
 */
describe("Edge Function create-cart-checkout — contrat frontend", () => {
  beforeEach(() => {
    cy.clearCart();
    cy.loginAsMockUser("contract@test.fr");

    // Stub de window.location.href pour intercepter la redirection Stripe
    cy.on("window:before:load", (win) => {
      let href = win.location.href;
      Object.defineProperty(win.location, "href", {
        get: () => href,
        set: (value: string) => {
          href = value;
          (win as unknown as { __redirectedTo?: string }).__redirectedTo = value;
        },
      });
    });
  });

  it("envoie chaque article du panier avec les bons champs", () => {
    cy.seedCart([
      {
        id: "prod-A",
        name: "Vinyle A",
        price: 20,
        image: "https://example.com/a.png",
        quantity: 2,
        size: "M",
        color: "noir",
      },
      {
        id: "prod-B",
        name: "Tee-shirt B",
        price: 15,
        image: "https://example.com/b.png",
        quantity: 1,
      },
    ]);
    cy.mockStripeCheckout();
    cy.visit("/cart");

    cy.contains(/passer commande|checkout|valider/i).click();

    cy.wait("@stripeCheckout").then(({ request }) => {
      const items = request.body.cartItems;
      expect(items).to.have.length(2);

      // Item #1 - avec size + color
      expect(items[0].product.id).to.eq("prod-A");
      expect(items[0].product.name).to.eq("Vinyle A");
      expect(items[0].quantity).to.eq(2);
      expect(items[0].size).to.eq("M");
      expect(items[0].color).to.eq("noir");

      // Item #2 - sans size/color
      expect(items[1].product.id).to.eq("prod-B");
      expect(items[1].quantity).to.eq(1);
    });
  });

  it("inclut un Authorization Bearer dans la requête", () => {
    cy.seedCart();
    cy.mockStripeCheckout();
    cy.visit("/cart");

    cy.contains(/passer commande|checkout|valider/i).click();

    cy.wait("@stripeCheckout").then(({ request }) => {
      // Supabase ajoute automatiquement l'Authorization depuis la session
      expect(request.headers).to.have.property("authorization");
      expect(String(request.headers.authorization)).to.match(/^Bearer /i);
    });
  });

  it("n'envoie PAS de prix final calculé côté client (sécurité)", () => {
    cy.seedCart([
      {
        id: "prod-X",
        name: "Test sécurité",
        price: 99,
        image: "https://example.com/x.png",
        quantity: 1,
      },
    ]);
    cy.mockStripeCheckout();
    cy.visit("/cart");

    cy.contains(/passer commande|checkout|valider/i).click();

    cy.wait("@stripeCheckout").then(({ request }) => {
      // Le body ne doit pas contenir un champ `total` ou `amount` global
      // calculé par le frontend (le serveur recalcule à partir de la DB).
      expect(request.body).not.to.have.property("total");
      expect(request.body).not.to.have.property("amount");
    });
  });
});