# 🧪 Tests Cypress — Guide complet

Ce dossier contient tous les tests automatisés du projet basés sur [Cypress](https://www.cypress.io/).

---

## 📦 Installation

Les dépendances sont déjà installées (`cypress` + `start-server-and-test`).
Si tu clones le projet à neuf :

```bash
npm install
```

---

## 🚀 Lancer les tests

Tous les scripts sont définis dans `package.json` :

| Commande | Description |
|----------|-------------|
| `npm run cy:open` | Ouvre l'interface graphique Cypress (le serveur dev doit déjà tourner) |
| `npm run cy:run` | Lance tous les tests E2E en mode headless (terminal) |
| `npm run cy:run:component` | Lance uniquement les tests de composants |
| `npm run test:e2e` | **Recommandé** : démarre `npm run dev` puis lance les tests E2E automatiquement |
| `npm run test:e2e:open` | Idem mais ouvre l'UI Cypress |

> 💡 Le mode `open` est idéal pour développer/déboguer ; le mode `run` pour la CI.

---

## 📁 Arborescence

```
cypress/
├── e2e/                    → Tests "end-to-end" : naviguent dans l'app comme un utilisateur réel
│   ├── home.cy.ts          → Page d'accueil
│   ├── shop.cy.ts          → Boutique
│   ├── cart.cy.ts          → Panier
│   ├── auth.cy.ts          → Connexion / Inscription
│   ├── contact.cy.ts       → Formulaire de contact
│   ├── navigation.cy.ts    → Routes globales + 404
│   ├── protected-routes.cy.ts → Vérification des accès admin/profile
│   ├── stripe-checkout.cy.ts       → 💳 Parcours de paiement (popup login + redirection Stripe)
│   ├── stripe-payment-success.cy.ts → 💳 Page /payment-success après retour Stripe
│   └── stripe-edge-function.cy.ts  → 💳 Contrat de l'Edge Function create-cart-checkout
├── component/              → Tests de composants React isolés (montés sans navigation)
│   ├── Button.cy.tsx
│   ├── Badge.cy.tsx
│   └── Input.cy.tsx
├── support/
│   ├── e2e.ts              → Code exécuté avant chaque test E2E
│   ├── component.ts        → Setup pour cy.mount()
│   ├── commands.ts         → Commandes personnalisées (cy.getByTestId, cy.loginAsMockUser, …)
│   └── component-index.html
├── fixtures/               → Données de test mockées (JSON)
│   ├── product.json
│   ├── user.json
│   ├── cart-item.json         → Article de panier type
│   └── stripe-checkout.json   → Réponse mockée de l'Edge Function Stripe
└── README.md               → Ce fichier
```

---

## ✍️ Écrire un nouveau test E2E

1. **Crée un fichier** `cypress/e2e/ma-feature.cy.ts`
2. **Structure de base** :

```ts
describe("Ma feature", () => {
  beforeEach(() => {
    cy.visit("/ma-route");
  });

  it("fait quelque chose", () => {
    cy.contains("Mon texte").should("be.visible");
    cy.get("button").click();
    cy.url().should("include", "/autre-page");
  });
});
```

### Sélecteurs recommandés (par ordre de priorité)

| Méthode | Exemple | Quand l'utiliser |
|---------|---------|------------------|
| `cy.getByTestId()` | `cy.getByTestId("submit-btn")` | **Idéal** — ajoute `data-testid="submit-btn"` au JSX |
| `cy.contains()` | `cy.contains("Valider")` | Texte visible par l'utilisateur |
| `cy.get("[role='dialog']")` | rôle ARIA | Accessibilité native |
| `cy.get("input[name='email']")` | sélecteurs HTML | Formulaires |
| `cy.get(".my-class")` | ❌ classe CSS | À éviter (fragile) |

### Assertions courantes

```ts
cy.get("h1").should("be.visible");
cy.get("input").should("have.value", "hello");
cy.contains("Erreur").should("not.exist");
cy.url().should("include", "/shop");
cy.get("button").should("be.disabled");
```

---

## 🧩 Écrire un test de composant

1. **Crée** `cypress/component/MonComposant.cy.tsx`
2. **Monte le composant** avec `cy.mount` :

```tsx
import { MonComposant } from "@/components/MonComposant";

describe("<MonComposant />", () => {
  it("affiche le titre", () => {
    cy.mount(<MonComposant title="Bonjour" />);
    cy.contains("Bonjour").should("be.visible");
  });

  it("appelle un callback", () => {
    const onClick = cy.stub().as("onClick");
    cy.mount(<MonComposant onClick={onClick} />);
    cy.get("button").click();
    cy.get("@onClick").should("have.been.calledOnce");
  });
});
```

> 💡 Si ton composant utilise `react-router`, `react-query` ou un context (Auth, Cart, …), il faut envelopper dans les providers correspondants. Exemple :

```tsx
import { BrowserRouter } from "react-router-dom";

cy.mount(
  <BrowserRouter>
    <MonComposant />
  </BrowserRouter>
);
```

---

## 🛠️ Commandes personnalisées disponibles

Définies dans `cypress/support/commands.ts` :

```ts
cy.getByTestId("login-button");      // Sélecteur par data-testid
cy.loginAsMockUser("admin@test.fr"); // Pose un faux token Supabase
cy.clearCart();                      // Vide le panier (localStorage)
cy.seedCart([{ id, name, price, image, quantity }]); // Pré-remplit le panier
cy.mockStripeCheckout();             // Mock l'Edge Function create-cart-checkout
cy.mockStripeSingleCheckout();       // Mock l'Edge Function create-checkout (achat unitaire)
```

Pour ajouter ta propre commande, édite `cypress/support/commands.ts` et déclare-la dans le bloc `declare global`.

---

## 💳 Tester le flux Stripe

Trois fichiers couvrent le paiement, **sans jamais appeler la vraie API Stripe** :

| Fichier | Ce qu'il vérifie |
|---------|------------------|
| `stripe-checkout.cy.ts` | Popup de connexion, redirection vers Stripe quand l'user est loggué, gestion d'erreur 500, bouton désactivé si panier vide |
| `stripe-payment-success.cy.ts` | Page `/payment-success` : confirmation, vidage du panier, bouton retour boutique |
| `stripe-edge-function.cy.ts` | Contrat de la requête envoyée à `create-cart-checkout` : structure des items, header `Authorization`, **absence de prix calculé côté client** (sécurité) |

### Comment ça marche ?

1. **`cy.seedCart([...])`** dépose un panier dans `localStorage` (clé `teknoland-cart`).
2. **`cy.mockStripeCheckout()`** intercepte `POST **/functions/v1/create-cart-checkout` et renvoie l'URL factice de `cypress/fixtures/stripe-checkout.json`.
3. Un **stub sur `window.location.href`** empêche la redirection réelle vers `checkout.stripe.com` et stocke l'URL dans `window.__redirectedTo` pour assertion.
4. **`cy.loginAsMockUser()`** pose un faux token Supabase pour que l'app considère l'user authentifié.

### Exemple minimal

```ts
it("redirige vers Stripe quand on valide le panier", () => {
  cy.loginAsMockUser("acheteur@test.fr");
  cy.seedCart();                  // panier par défaut : 1 vinyle à 25€
  cy.mockStripeCheckout();        // alias par défaut : @stripeCheckout
  cy.visit("/cart");

  cy.contains(/passer commande/i).click();
  cy.wait("@stripeCheckout");     // attend l'appel Edge Function
  cy.window().its("__redirectedTo").should("include", "checkout.stripe.com");
});
```

### Tester un cas d'erreur

```ts
cy.mockStripeCheckout("stripeCheckout", 500); // 2e arg = statusCode
// → l'app affichera un toast d'erreur, l'user reste sur /cart
```

### ⚠️ À retenir

- **On ne teste jamais la vraie Edge Function** depuis Cypress — elle est testée via `supabase--test_edge_functions` (Deno) côté backend.
- Si tu changes le **contrat** (ajout/suppression de champ dans `cartItems`), mets à jour `stripe-edge-function.cy.ts` ET la fonction Deno côté `supabase/functions/create-cart-checkout/`.
- Le test "n'envoie PAS de prix final calculé côté client" garantit le respect de la mémoire `securite-flux-paiement` : le serveur recalcule toujours les prix.
- Pour tester un **vrai** parcours bout-en-bout avec carte de test Stripe (`4242 4242 4242 4242`), il faut désactiver les mocks et passer en mode `sandbox` Stripe — ce n'est pas couvert ici.

---

## 📝 Bonnes pratiques

1. **Un `describe` par feature, un `it` par comportement.**
2. **Toujours utiliser `data-testid`** pour les éléments critiques — c'est plus stable que les classes ou textes.
3. **Préférer `cy.intercept()`** pour mocker les appels Supabase plutôt que d'attaquer la vraie DB :
   ```ts
   cy.intercept("POST", "**/auth/v1/token**", { fixture: "user.json" });
   ```
4. **Nettoyer l'état** dans `beforeEach` (localStorage, cookies, panier).
5. **Éviter `cy.wait(2000)`** ; utiliser `cy.get(..., { timeout: 10000 })` à la place.
6. **Tests E2E = parcours utilisateur**, pas testing unitaire de logique métier (c'est le rôle de Vitest).

---

## 🐛 Déboguer un test

- Lance `npm run test:e2e:open` → l'UI Cypress montre chaque étape avec des screenshots.
- Ajoute `cy.pause()` dans le test pour mettre en pause.
- Utilise `.debug()` : `cy.get("button").debug().click()`.
- Les screenshots d'échec sont stockés dans `cypress/screenshots/`.

---

## 🔌 Mocker Supabase / API

Exemple pour intercepter une requête à la table `products` :

```ts
cy.intercept("GET", "**/rest/v1/products*", {
  statusCode: 200,
  body: [{ id: "1", name: "Produit Test", price: 10 }],
}).as("getProducts");

cy.visit("/shop");
cy.wait("@getProducts");
cy.contains("Produit Test").should("be.visible");
```

---

## ➕ Tests à ajouter (suggestions)

- [ ] Ajout d'un produit au panier (parcours complet)
- [ ] Checkout Stripe (avec mock de la edge function)
- [ ] Espace admin (création/édition de produit) — nécessite un user admin de test
- [ ] Newsletter : inscription + confirmation
- [ ] Lecteur audio vinyle : play/pause
- [ ] Filtres boutique (catégorie + couleur + tri)
- [ ] Page favoris
- [ ] Multilingue (FR/EN switcher)

---

## 📚 Ressources

- [Documentation Cypress](https://docs.cypress.io/)
- [Best practices](https://docs.cypress.io/guides/references/best-practices)
- [Component testing React](https://docs.cypress.io/guides/component-testing/react/overview)