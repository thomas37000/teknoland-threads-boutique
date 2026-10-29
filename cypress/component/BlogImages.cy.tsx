import { supabase } from "@/integrations/supabase/client";
import StorageImagePicker from "@/components/admin/product/StorageImagePicker";
import AllBucketsGallery from "@/components/admin/images/AllBucketsGallery";

// `supabase.functions` est un getter qui renvoie une nouvelle instance à chaque accès :
// `cy.stub(supabase.functions, "invoke")` ne serait jamais vu par le composant.
// On intercepte donc l'appel HTTP réel de la fonction `manage-buckets`.
describe("Images du Blog (stockage simulé)", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/functions/v1/manage-buckets*", { body: { buckets: [{ name: "blog" }, { name: "products" }, { name: "stickers" }] } }).as("buckets");
    cy.intercept("POST", "**/storage/v1/object/list/*", { body: [{ id: "image-test", name: "image-test.png", metadata: { size: 1024 }, created_at: "2026-10-28T10:00:00Z" }] });
  });

  it("propose blog par défaut et sélectionne une image d'un autre bucket sans la copier", () => {
    cy.mount(<StorageImagePicker open preferredBucket="blog" onClose={cy.stub()} onSelect={cy.stub().as("selected")} />);
    cy.get('[role="tab"][data-state="active"]', { timeout: 8000 }).should("contain.text", "blog");
    cy.contains('[role="tab"]', "products").click();
    cy.get('[aria-label="Choisir image-test.png"]', { timeout: 8000 }).click();
    cy.get("@selected").should("have.been.calledWith", supabase.storage.from("products").getPublicUrl("image-test.png").data.publicUrl);
  });

  it("importe dans blog depuis la galerie admin", () => {
    cy.intercept("POST", "**/storage/v1/object/blog/*", { body: { Key: "blog/image-test.png", Id: "image-test" } }).as("upload");
    cy.mount(<AllBucketsGallery />);
    cy.contains('[role="tab"]', "blog", { timeout: 8000 }).click();
    cy.get("#bucket-img-upload").selectFile({ contents: Cypress.Buffer.from("image de test"), fileName: "image-test.png", mimeType: "image/png" });
    cy.wait("@upload").then(({ request }) => {
      expect(new URL(request.url).pathname).to.match(/\/object\/blog\/\d+-image-test\.png$/);
    });
  });
});
