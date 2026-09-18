/**
 * Tests de composant - Notifications Discogs
 * ------------------------------------------
 * Vérifie l'affichage des notifications (bulles rouges + pastilles "+N")
 * sur les cartes de releases Discogs en admin.
 *
 * Composants testés :
 *  - src/components/admin/discogs/DeltaBadge.tsx
 *  - src/components/admin/discogs/ReleaseCard.tsx
 *
 * Règles métier couvertes :
 *  - un delta > 0 (collection, wantlist ou vente) affiche la bulle rouge
 *  - un delta <= 0 n'affiche rien
 *  - la pastille "+N" en vente s'affiche à côté du nombre d'exemplaires
 */
import { DeltaBadge } from "@/components/admin/discogs/DeltaBadge";
import { ReleaseCard } from "@/components/admin/discogs/ReleaseCard";
import type { DiscogsRelease } from "@/hooks/useDiscogs";

/** Release factice réutilisable ; surcharger les champs au besoin. */
const makeRelease = (over: Partial<DiscogsRelease> = {}): DiscogsRelease => ({
  id: "uuid-1",
  release_id: 37668816,
  title: "Tribe du Nord",
  artist: "Teknoland",
  year: 2024,
  thumbnail: null,
  discogs_url: "https://www.discogs.com/release/37668816",
  current_collection_count: 12,
  current_wantlist_count: 8,
  num_for_sale: 4,
  lowest_price: 14.5,
  last_synced_at: null,
  ...over,
});

/** Sélecteur de la bulle rouge (span animé positionné en haut à droite). */
const redDot = () => cy.get("span.animate-ping");

describe("<DeltaBadge />", () => {
  it("affiche +N quand le delta est positif", () => {
    cy.mount(<DeltaBadge label="Coll." delta={3} tone="collection" />);
    cy.contains("Coll. +3").should("be.visible");
  });

  it("n'affiche rien quand le delta est nul ou négatif", () => {
    cy.mount(<DeltaBadge label="Coll." delta={0} tone="collection" />);
    cy.contains("Coll.").should("not.exist");
    cy.mount(<DeltaBadge label="Want" delta={-2} tone="wantlist" />);
    cy.contains("Want").should("not.exist");
  });
});

describe("<ReleaseCard /> - notifications", () => {
  it("affiche la bulle rouge et le badge quand un vinyle est ajouté en collection", () => {
    cy.mount(
      <ReleaseCard release={makeRelease()} deltaCollection={1} deltaWantlist={0} deltaForSale={0} />,
    );
    redDot().should("exist");
    cy.contains("Coll. +1").should("be.visible");
    cy.contains("Want").should("not.exist");
    cy.contains("Vente").should("not.exist");
  });

  it("affiche la notification wantlist", () => {
    cy.mount(
      <ReleaseCard release={makeRelease()} deltaCollection={0} deltaWantlist={2} deltaForSale={0} />,
    );
    redDot().should("exist");
    cy.contains("Want +2").should("be.visible");
  });

  it("affiche la notification et la pastille pour un nouvel exemplaire en vente", () => {
    cy.mount(
      <ReleaseCard release={makeRelease()} deltaCollection={0} deltaWantlist={0} deltaForSale={3} />,
    );
    redDot().should("exist");
    cy.contains("Vente +3").should("be.visible");
    cy.contains("4 en vente").should("be.visible");
    cy.contains("+3").should("be.visible");
  });

  it("cumule les trois notifications", () => {
    cy.mount(
      <ReleaseCard release={makeRelease()} deltaCollection={1} deltaWantlist={2} deltaForSale={3} />,
    );
    cy.contains("Coll. +1").should("be.visible");
    cy.contains("Want +2").should("be.visible");
    cy.contains("Vente +3").should("be.visible");
  });

  it("n'affiche aucune notification sans delta", () => {
    cy.mount(
      <ReleaseCard release={makeRelease()} deltaCollection={0} deltaWantlist={0} deltaForSale={0} />,
    );
    redDot().should("not.exist");
    cy.contains("Coll.").should("not.exist");
  });

  it("affiche les compteurs courants et le lien marketplace", () => {
    cy.mount(
      <ReleaseCard release={makeRelease()} deltaCollection={0} deltaWantlist={0} deltaForSale={0} />,
    );
    cy.contains("Tribe du Nord").should("be.visible");
    cy.contains("12").should("be.visible");
    cy.contains("8").should("be.visible");
    cy.contains("dès 14.50 €").should("be.visible");
    cy.get("a[href='https://www.discogs.com/fr/sell/release/37668816']").should("exist");
  });
});
