import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ArtistesMultiSelect } from "./ArtistesMultiSelect";
import { formatList, toIdArray } from "../utils";
import type { Artiste, VinyleFields, VinyleRecord } from "../types";

/**
 * Formulaire d'ajout / modification d'un vinyle. Les changements sont
 * synchronisés côté parent via `onSave`, qui doit gérer l'appel Airtable.
 */
export const VinyleFormDialog = ({
  open,
  onOpenChange,
  editing,
  form,
  setForm,
  artistes,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: VinyleRecord | null;
  form: VinyleFields;
  setForm: (f: VinyleFields) => void;
  artistes: Artiste[];
  saving: boolean;
  onSave: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier le vinyle" : "Ajouter un vinyle"}
          </DialogTitle>
          <DialogDescription>
            Les modifications sont synchronisées directement avec la table
            Airtable « Vinyles ».
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ref</Label>
            <Input
              value={form.Ref || ""}
              onChange={(e) => setForm({ ...form, Ref: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={form.Titre || ""}
              onChange={(e) => setForm({ ...form, Titre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Artistes</Label>
            <ArtistesMultiSelect
              artistes={artistes}
              value={toIdArray(form.Artistes)}
              onChange={(ids) => setForm({ ...form, Artistes: ids })}
            />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Input
              value={form.Format || ""}
              onChange={(e) => setForm({ ...form, Format: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Styles (séparés par des virgules)</Label>
            <Input
              value={
                typeof form.Styles === "string"
                  ? form.Styles
                  : formatList(form.Styles)
              }
              onChange={(e) => setForm({ ...form, Styles: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Date de sortie</Label>
            <Input
              type="date"
              value={form.Date_de_sortie || ""}
              onChange={(e) =>
                setForm({ ...form, Date_de_sortie: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input
              type="number"
              value={form.Stock ?? 0}
              onChange={(e) =>
                setForm({ ...form, Stock: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Prix distributeur (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.Prix_distributeur ?? 0}
              onChange={(e) =>
                setForm({
                  ...form,
                  Prix_distributeur: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};