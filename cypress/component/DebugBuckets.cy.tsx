import { supabase } from "@/integrations/supabase/client";
import StorageImagePicker from "@/components/admin/product/StorageImagePicker";
import { useBuckets } from "@/hooks/useBuckets";

const Probe = () => {
  const { buckets, loading } = useBuckets();
  return <div data-testid="probe">buckets={buckets.join(",")} loading={String(loading)}</div>;
};

describe("debug buckets", () => {
  it("intercepts the manage-buckets HTTP call", () => {
    cy.intercept("POST", "**/functions/v1/manage-buckets*", { body: { buckets: [{ name: "blog" }, { name: "products" }] } }).as("buckets");
    cy.mount(<Probe />);
    cy.get('[data-testid="probe"]', { timeout: 8000 }).should("contain.text", "blog");
    cy.mount(<StorageImagePicker open preferredBucket="blog" onClose={cy.stub()} onSelect={cy.stub()} />);
    cy.get('[role="tab"]', { timeout: 8000 }).should("have.length", 2);
    cy.get('[role="tab"][data-state="active"]').should("contain.text", "blog");
  });
});
