import * as post from "../fixtures/blog-post.json";

describe("Blog : parcours visiteur (requêtes simulées)", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/rest/v1/blog_posts*", (req) => {
      const url = new URL(req.url);
      if (url.searchParams.has("slug")) req.reply({ body: post });
      else req.reply({ body: [post] });
    }).as("posts");
    cy.intercept("GET", "**/rest/v1/blog_comments*", { body: [] });
  });

  it("demande uniquement les articles publiés pour un visiteur", () => {
    cy.visit("/blog");
    cy.wait("@posts").then(({ request }) => {
      expect(new URL(request.url).searchParams.get("status")).to.equal("eq.published");
    });
    cy.contains("button", "Nouvel article").should("not.exist");
  });

  it("ouvre l'article depuis la liste et relit son contenu", () => {
    cy.visit("/blog");
    cy.contains("a", post.title).click();
    cy.location("pathname").should("equal", `/blog/${post.slug}`);
    cy.contains("Un nouveau disque arrive.").should("be.visible");
    cy.reload();
    cy.contains("Un nouveau disque arrive.").should("be.visible");
    cy.contains("button", "Modifier sur la page").should("not.exist");
  });

  it("soumet le commentaire sans pouvoir le valider lui-même", () => {
    cy.intercept("POST", "**/rest/v1/blog_comments*", { statusCode: 201, body: null }).as("comment");
    cy.visit(`/blog/${post.slug}`);
    cy.get('[aria-label="Votre nom"]').type("Lecteur test");
    cy.get('[aria-label="Votre commentaire"]').type("Merci pour cette sortie");
    cy.contains("button", "Publier le commentaire").click();
    cy.wait("@comment").its("request.body").should("deep.equal", { post_id: post.id, author_name: "Lecteur test", content: "Merci pour cette sortie" });
    cy.get('[aria-label="Votre commentaire"]').should("have.value", "");
    cy.get("article").should("not.contain.text", "Merci pour cette sortie");
  });
});