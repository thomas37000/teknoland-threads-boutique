import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { VinyleRecord } from "../types";

/** Confirmation de suppression d'un vinyle (destructif, propage à Airtable). */
export const DeleteVinyleDialog = ({
  open,
  onOpenChange,
  target,
  saving,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  target: VinyleRecord | null;
  saving: boolean;
  onConfirm: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le vinyle</DialogTitle>
          <DialogDescription>
            Confirmer la suppression de « {target?.fields.Titre} » ? Cette
            action est définitive sur Airtable.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};