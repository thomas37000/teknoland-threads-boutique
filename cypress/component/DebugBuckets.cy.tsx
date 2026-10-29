import { supabase } from "@/integrations/supabase/client";
import StorageImagePicker from "@/components/admin/product/StorageImagePicker";
import { useBuckets } from "@/hooks/useBuckets";

const Probe = () => {
  const { buckets, loading } = useBuckets();
  return <div data-testid="probe">buckets={buckets.join(",")} loading={String(loading)}</div>;
};

describe("debug buckets", () => {
  it("shows what the picker renders", () => {
    cy.stub(supabase.functions, "invoke").resolves({ data: { buckets: [{ name: "blog" }, { name: "products" }] }, error: null });
    cy.mount(<Probe />);
    cy.get('[data-testid="probe"]', { timeout: 8000 }).should("contain.text", "blog");
    cy.mount(<StorageImagePicker open preferredBucket="blog" onClose={cy.stub()} onSelect={cy.stub()} />);
    cy.get("body").then(($b) => cy.log($b.text().slice(0, 400)));
    cy.get("body").then(($b) => {
      // eslint-disable-next-line no-console
      console.log("DOM:", $b.html().slice(0, 1500));
    });
  });
});
