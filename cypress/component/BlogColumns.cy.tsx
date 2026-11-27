/**
 * Tests du bloc « 2 colonnes » : une image optionnelle dans chaque colonne.
 * ------------------------------------------------------------------------
 * Les requêtes Supabase sont simulées (cy.intercept) : aucun appel réseau réel.
 * Les images de test ne sont pas chargées réellement : on vérifie donc les
 * attributs (src, alt) et la présence des éléments plutôt que leur rendu.
 */
import PostEditor from "@/components/blog/PostEditor";
import BlockRenderer from "@/components/blog/BlockRenderer";
import { BlogPost } from "@/lib/blog";
import postFixture from "../fixtures/blog-post.json";

const base = postFixture as BlogPost;

const columnsPost: BlogPost = {
  ...base,
  editor_mode: "blocks",
  content: [
    {
      id: "col1",
      type: "columns",
      data: {
        left: "<p>Gauche</p>",
        right: "<p>Droite</p>",
        leftImage: "",
        leftAlt: "",
        leftCaption: "",
        rightImage: "",
        rightAlt: "",
        rightCaption: "",
      },
    },
  ],
};

const LEFT = "https://example.com/gauche.jpg";
const RIGHT = "https://example.com/droite.jpg";

describe("Blog : image dans chaque colonne du bloc 2 colonnes", () => {
  beforeEach(() => {
    // Le sélecteur d'images liste les buckets dès son montage : on répond sans réseau.
    cy.intercept("POST", "**/functions/v1/manage-buckets*", { body: { buckets: [{ name: "blog" }] } });
  });

  const openColumnsBlock = () => {
    cy.mount(<PostEditor post={columnsPost} onSaved={cy.stub()} />);
    cy.get('[data-block-type="columns"] button[title="Modifier"]').click();
  };

  it("propose un champ image pour la colonne gauche et pour la colonne droite", () => {
    openColumnsBlock();
    cy.get('[data-block-type="columns"] input[placeholder="Adresse de l\'image"]').should("have.length", 2);
    cy.get('[data-block-type="columns"]').should("contain.text", "Image colonne gauche").and("contain.text", "Image colonne droite");
  });

  it("affiche un aperçu et une croix pour chaque image saisie", () => {
    openColumnsBlock();
    cy.get('[data-block-type="columns"] input[placeholder="Adresse de l\'image"]').first().type(LEFT);
    cy.get('[data-block-type="columns"] input[placeholder="Adresse de l\'image"]').eq(1).type(RIGHT);
    cy.get('[data-block-type="columns"] img[src="' + LEFT + '"]').should("have.length", 1);
    cy.get('[data-block-type="columns"] img[src="' + RIGHT + '"]').should("have.length", 1);
    cy.get('[aria-label="Retirer l\'image colonne gauche"]').should("have.length", 1);
    cy.get('[aria-label="Retirer l\'image colonne droite"]').should("have.length", 1);
  });

  it("enregistre les deux images avec l'article", () => {
    cy.intercept("PATCH", "**/rest/v1/blog_posts*", { body: columnsPost }).as("update");
    openColumnsBlock();
    cy.get('[data-block-type="columns"] input[placeholder="Adresse de l\'image"]').first().type(LEFT);
    cy.get('[data-block-type="columns"] input[placeholder="Adresse de l\'image"]').eq(1).type(RIGHT);
    cy.get('[data-block-type="columns"] input[placeholder="Légende"]').first().type("Poche gauche");
    cy.contains("button", "Enregistrer").click();
    cy.wait("@update").its("request.body.content").then((content: any) => {
      expect(content[0].data.leftImage).to.equal(LEFT);
      expect(content[0].data.rightImage).to.equal(RIGHT);
      expect(content[0].data.leftCaption).to.equal("Poche gauche");
    });
  });

  it("retire une image sans toucher à l'autre colonne", () => {
    openColumnsBlock();
    cy.get('[data-block-type="columns"] input[placeholder="Adresse de l\'image"]').first().type(LEFT);
    cy.get('[data-block-type="columns"] input[placeholder="Adresse de l\'image"]').eq(1).type(RIGHT);
    cy.get('[aria-label="Retirer l\'image colonne gauche"]').click();
    cy.get('[aria-label="Retirer l\'image colonne gauche"]').should("not.exist");
    cy.get('[data-block-type="columns"] input[placeholder="Adresse de l\'image"]').first().should("have.value", "");
    cy.get('[data-block-type="columns"] img[src="' + RIGHT + '"]').should("have.length", 1);
  });

  it("affiche les deux images et leurs légendes côté lecteur", () => {
    cy.mount(
      <BlockRenderer
        mode="blocks"
        content={[
          {
            id: "col1",
            type: "columns",
            data: {
              left: "<p>Gauche</p>",
              right: "<p>Droite</p>",
              leftImage: LEFT,
              leftAlt: "Pochette gauche",
              leftCaption: "Poche gauche",
              rightImage: RIGHT,
              rightAlt: "",
              rightCaption: "Poche droite",
            },
          },
        ]}
      />,
    );
    cy.get("figure img").should("have.length", 2);
    cy.get('img[src="' + LEFT + '"]').should("have.attr", "alt", "Pochette gauche");
    cy.get("figcaption").should("have.length", 2).and("contain.text", "Poche gauche").and("contain.text", "Poche droite");
    cy.contains("p", "Gauche").should("exist");
    cy.contains("p", "Droite").should("exist");
  });

  it("garde une colonne sans image quand l'autre en a une", () => {
    cy.mount(
      <BlockRenderer
        mode="blocks"
        content={[
          { id: "col1", type: "columns", data: { left: "<p>Gauche</p>", right: "<p>Droite</p>", leftImage: LEFT } },
        ]}
      />,
    );
    cy.get("figure").should("have.length", 1);
    cy.get("figure img").should("have.attr", "src", LEFT);
    cy.contains("p", "Droite").should("exist");
  });
});
