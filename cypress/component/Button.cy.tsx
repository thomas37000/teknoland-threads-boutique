/**
 * Tests de composant - Button (shadcn/ui)
 * ----------------------------------------
 * Démontre le test isolé d'un composant UI.
 */
import { Button } from "@/components/ui/button";

describe("<Button />", () => {
  it("affiche le texte enfant", () => {
    cy.mount(<Button>Cliquez-moi</Button>);
    cy.contains("Cliquez-moi").should("be.visible");
  });

  it("appelle onClick quand on clique", () => {
    const onClick = cy.stub().as("onClick");
    cy.mount(<Button onClick={onClick}>Action</Button>);
    cy.contains("Action").click();
    cy.get("@onClick").should("have.been.calledOnce");
  });

  it("est désactivé avec disabled", () => {
    cy.mount(<Button disabled>Désactivé</Button>);
    cy.contains("Désactivé").should("be.disabled");
  });

  it("applique la variante destructive", () => {
    cy.mount(<Button variant="destructive">Supprimer</Button>);
    cy.contains("Supprimer").should("have.class", "bg-destructive");
  });
});