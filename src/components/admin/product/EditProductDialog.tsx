import { Button } from "@/components/ui/button";
import PopupAdmin from "../PopupAdmin";
import { ProductForm } from "./ProducForm";

export function EditProductDialog({ isOpen, onClose, onSubmit, product, setProduct, ...props }) {
  return (
    <PopupAdmin isOpen={isOpen} onClose={onClose} title="Edit Product" maxWidth="max-w-2xl">
      <ProductForm product={product} setProduct={setProduct} mode="edit" {...props} />
      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSubmit} className="flex-1">Save Changes</Button>
      </div>
    </PopupAdmin>
  );
}
