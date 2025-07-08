
import React, { useState, useEffect } from "react";
import { DepenseMois } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddDepenseDialogProps {
  onDepenseAdded: () => void;
}

interface EditDepenseDialogProps {
  depense: DepenseMois | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepenseUpdated: () => void;
}

export const AddDepenseDialog = ({ onDepenseAdded }: AddDepenseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    annee: "",
    total: "",
    semaine_moyenne: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("depenses_mois")
        .insert({
          annee: formData.annee,
          total: parseFloat(formData.total),
          semaine_moyenne: parseFloat(formData.semaine_moyenne),
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Dépense ajoutée avec succès",
      });

      setFormData({ annee: "", total: "", semaine_moyenne: "" });
      setOpen(false);
      onDepenseAdded();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de la dépense",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une dépense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle dépense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="annee">Année</Label>
            <Input
              id="annee"
              value={formData.annee}
              onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
              placeholder="2024"
              required
            />
          </div>
          <div>
            <Label htmlFor="total">Total (€)</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: e.target.value })}
              placeholder="1200.50"
              required
            />
          </div>
          <div>
            <Label htmlFor="semaine_moyenne">Moyenne par semaine (€)</Label>
            <Input
              id="semaine_moyenne"
              type="number"
              step="0.01"
              value={formData.semaine_moyenne}
              onChange={(e) => setFormData({ ...formData, semaine_moyenne: e.target.value })}
              placeholder="23.08"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const EditDepenseDialog = ({
  depense,
  open,
  onOpenChange,
  onDepenseUpdated,
}: EditDepenseDialogProps) => {
  const [formData, setFormData] = useState({
    annee: "",
    total: "",
    semaine_moyenne: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (depense) {
      setFormData({
        annee: depense.annee,
        total: depense.total.toString(),
        semaine_moyenne: depense.semaine_moyenne.toString(),
      });
    }
  }, [depense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depense) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("depenses_mois")
        .update({
          annee: formData.annee,
          total: parseFloat(formData.total),
          semaine_moyenne: parseFloat(formData.semaine_moyenne),
        })
        .eq("id", depense.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Dépense modifiée avec succès",
      });

      onOpenChange(false);
      onDepenseUpdated();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification de la dépense",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la dépense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-annee">Année</Label>
            <Input
              id="edit-annee"
              value={formData.annee}
              onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-total">Total (€)</Label>
            <Input
              id="edit-total"
              type="number"
              step="0.01"
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-semaine-moyenne">Moyenne par semaine (€)</Label>
            <Input
              id="edit-semaine-moyenne"
              type="number"
              step="0.01"
              value={formData.semaine_moyenne}
              onChange={(e) => setFormData({ ...formData, semaine_moyenne: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
