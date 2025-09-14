import { Button } from "@/components/ui/button";
import PopupAdmin from "../PopupAdmin";

export function DeleteProductDialog({ isOpen, onClose, onConfirm, currentProduct }) {
  return (
    <PopupAdmin isOpen={isOpen} onClose={onClose} title="Supprimer le produit">
      <p className="text-gray-600 mb-6">
        Etes vous sur de vouloir supprimer "{currentProduct?.name}"?
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Annulez
        </Button>
        <Button variant="destructive" onClick={onConfirm} className="flex-1">
          Supprimez
        </Button>
      </div>
    </PopupAdmin>
  );
}
