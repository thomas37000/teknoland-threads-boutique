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
describe("Blog : pagination de la liste (8 articles par page)", () => {
  const many = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      ...post,
      id: `11111111-1111-4111-8111-${String(i + 1).padStart(12, "0")}`,
      title: `Article ${i + 1}`,
      slug: `article-${i + 1}`,
      published_at: new Date(Date.UTC(2026, 9, 27 - i)).toISOString(),
      created_at: new Date(Date.UTC(2026, 9, 27 - i)).toISOString(),
    }));

  beforeEach(() => {
    cy.intercept("GET", "**/rest/v1/blog_posts*", (req) => {
      if (new URL(req.url).searchParams.has("slug")) req.reply({ body: post });
      else req.reply({ body: many(9) });
    }).as("posts");
    cy.intercept("GET", "**/rest/v1/blog_comments*", { body: [] });
  });

  it("affiche 8 articles sur la première page et le reste sur la seconde", () => {
    cy.visit("/blog");
    cy.get("article").should("have.length", 8);
    cy.contains("a", "Article 9").should("not.exist");
    cy.get('nav[aria-label="pagination"]').within(() => {
      cy.get('button[aria-label="Page précédente"]').should("be.disabled");
      cy.contains("button", "2").click();
    });
    cy.get("article").should("have.length", 1);
    cy.contains("a", "Article 9").should("be.visible");
    cy.contains("a", "Article 1").should("not.exist");
    cy.get('button[aria-label="Page suivante"]').should("be.disabled");
  });

  it("masque la pagination quand il y a 8 articles ou moins", () => {
    cy.intercept("GET", "**/rest/v1/blog_posts*", { body: many(8) });
    cy.visit("/blog");
    cy.get("article").should("have.length", 8);
    cy.get('nav[aria-label="pagination"]').should("not.exist");
  });

  it("revient à la première page quand on change de catégorie", () => {
    cy.intercept("GET", "**/rest/v1/blog_posts*", {
      body: many(17).map((p, i) => ({ ...p, category: i < 9 ? "Sorties" : "Ateliers" })),
    });
    cy.visit("/blog");
    cy.get("article").should("have.length", 8);
    cy.get('nav[aria-label="pagination"]').contains("button", "3").click();
    cy.get("article").should("have.length", 1);
    cy.contains("a", "Article 17").should("be.visible");
    cy.contains("button", "Sorties").click();
    cy.get("article").should("have.length", 8);
    cy.contains("a", "Article 1").should("be.visible");
    cy.contains("a", "Article 17").should("not.exist");
  });
});

// --- Visionneuse d'image (clic sur une image de l'article) ---
// Image SVG intégrée au test : dimensions connues (640 × 400), aucune requête réseau.
const svg = (w: number, h: number, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${color}"/></svg>`,
  )}`;

describe("Blog : agrandissement des images de l'article", () => {
  const cover = svg(640, 400, "#1f6f54");
  const inline = svg(240, 180, "#8b2f2f");

  beforeEach(() => {
    cy.intercept("GET", "**/rest/v1/blog_posts*", (req) => {
      const body = {
        ...post,
        cover_image: cover,
        content: { html: `<p>Un nouveau disque arrive.</p><p><img src="${inline}" alt="Pochette"></p>` },
      };
      const url = new URL(req.url);
      if (url.searchParams.has("slug")) req.reply({ body });
      else req.reply({ body: [body] });
    }).as("posts");
    cy.intercept("GET", "**/rest/v1/blog_comments*", { body: [] });
  });

  it("agrandit l'image de couverture au clic, à sa taille réelle", () => {
    cy.visit(`/blog/${post.slug}`);
    cy.get('[role="dialog"]').should("not.exist");

    // Clic sur la couverture : la visionneuse s'ouvre avec les dimensions natives.
    cy.get("article img").first().click();
    cy.get('[role="dialog"]').should("be.visible").and("contain.text", "640 × 400 px");
    cy.get('[role="dialog"] img').should("be.visible");

    // "Taille réelle" affiche l'image à ses dimensions natives.
    cy.contains("button", "Taille réelle").click();
    cy.get('[role="dialog"]').should("contain.text", "taille réelle");
    cy.get('[role="dialog"] img').should("have.attr", "style").and("include", "width: 640px");

    // Échap referme la visionneuse.
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("agrandit aussi une image insérée dans le texte de l'article", () => {
    cy.visit(`/blog/${post.slug}`);
    cy.contains("p", "Un nouveau disque arrive.").should("be.visible");

    // La 2e image du texte s'ouvre avec ses propres dimensions (240 × 180).
    cy.get("article img").eq(1).click();
    cy.get('[role="dialog"]').should("be.visible").and("contain.text", "240 × 180 px");

    // La croix referme la visionneuse.
    cy.get('button[aria-label="Fermer"]').last().click();
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("ferme la visionneuse en cliquant sur le fond sombre", () => {
    cy.visit(`/blog/${post.slug}`);
    cy.get("article img").first().click();
    cy.get('[role="dialog"]').should("be.visible");

    // Clic dans un coin (hors de l'image) = fond sombre.
    cy.get('[role="dialog"]').click(20, 20);
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("ne ferme pas la page : un clic sur une image ne change pas l'URL", () => {
    cy.visit(`/blog/${post.slug}`);
    cy.get("article img").first().click();
    cy.location("pathname").should("equal", `/blog/${post.slug}`);
    cy.get('[role="dialog"]').should("be.visible");
  });
});
