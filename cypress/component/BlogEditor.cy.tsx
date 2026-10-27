import PostEditor from "@/components/blog/PostEditor";
import BlogManagement from "@/components/admin/BlogManagement";
import { BlogPost, sanitize } from "@/lib/blog";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import postFixture from "../fixtures/blog-post.json";

const post = postFixture as BlogPost;

describe("Blog : édition et modération (requêtes simulées)", () => {
  it("enregistre un nouvel article comme brouillon par défaut", () => {
    cy.intercept("POST", "**/rest/v1/blog_posts*", { body: { ...post, status: "draft" } }).as("save");
    cy.mount(<PostEditor onSaved={cy.stub().as("saved")} />);
    cy.get("#post-title").type("Sortie vinyle test");
    cy.contains("button", "Enregistrer").click();
    cy.wait("@save").its("request.body").should("include", { title: post.title, slug: post.slug, status: "draft", published_at: null });
    cy.get("@saved").should("have.been.calledOnce");
  });

  it("publie un article avec son contenu enrichi", () => {
    cy.intercept("POST", "**/rest/v1/blog_posts*", { body: post }).as("publish");
    cy.mount(<PostEditor onSaved={cy.stub()} />);
    cy.get("#post-title").type(post.title);
    cy.contains("button", "Texte enrichi").click();
    cy.get("[contenteditable]").type("Un nouveau disque arrive.");
    cy.get('[role="switch"]').click();
    cy.contains("button", "Enregistrer").click();
    cy.wait("@publish").then(({ request }) => {
      expect(request.body.status).to.equal("published");
      expect(request.body.published_at).to.match(/^\d{4}-\d{2}-\d{2}T/);
      expect(request.body.content.html).to.contain("Un nouveau disque arrive.");
    });
  });

  it("modifie un article sans changer sa date de publication", () => {
    cy.intercept("PATCH", "**/rest/v1/blog_posts*", { body: { ...post, title: "Titre modifié" } }).as("update");
    cy.mount(<PostEditor post={post} onSaved={cy.stub().as("saved")} />);
    cy.get("#post-title").clear().type("Titre modifié");
    cy.contains("button", "Enregistrer").click();
    cy.wait("@update").its("request.body").should("include", { title: "Titre modifié", slug: post.slug, published_at: post.published_at });
    cy.get("@saved").should("have.been.calledOnce");
  });

  it("conserve la saisie si l'adresse est déjà utilisée", () => {
    cy.intercept("POST", "**/rest/v1/blog_posts*", { statusCode: 409, body: { code: "23505", message: "duplicate" } });
    cy.mount(<><Toaster /><PostEditor onSaved={cy.stub().as("saved")} /></>);
    cy.get("#post-title").type(post.title);
    cy.contains("button", "Enregistrer").click();
    cy.contains("Cette adresse (slug) existe déjà").should("be.visible");
    cy.get("#post-title").should("have.value", post.title);
    cy.get("@saved").should("not.have.been.called");
  });

  it("supprime les scripts et attributs dangereux du texte enrichi", () => {
    const result = sanitize('<p onclick="alert(1)">Texte</p><script>alert(1)</script><a href="javascript:alert(1)">Lien</a>');
    expect(result).to.contain("Texte");
    expect(result).not.to.contain("onclick");
    expect(result).not.to.contain("<script");
    expect(result).not.to.contain("javascript:");
  });

  it("valide explicitement un commentaire avant son affichage public", () => {
    let approved = false;
    cy.intercept("GET", "**/rest/v1/blog_posts*", { body: [post] });
    cy.intercept("GET", "**/rest/v1/blog_comments*", (req) => req.reply({ body: [{ id: "comment-test", post_id: post.id, author_name: "Lecteur", content: "Merci", approved, created_at: post.created_at, blog_posts: { title: post.title } }] }));
    cy.intercept("PATCH", "**/rest/v1/blog_comments*", (req) => { approved = true; req.reply({ statusCode: 204 }); }).as("approve");
    cy.mount(<BrowserRouter><BlogManagement /></BrowserRouter>);
    cy.contains('[role="tab"]', "Commentaires").click();
    cy.contains("button", "Valider").click();
    cy.wait("@approve").its("request.body").should("deep.equal", { approved: true });
    cy.contains("button", "Valider").should("not.exist");
  });
});