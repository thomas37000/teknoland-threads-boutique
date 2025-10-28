import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Artistes } from "@/types";
import { Loader2 } from "lucide-react";

interface AddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artiste?: Artistes | null;
  onSuccess: () => void;
}

export const AddEditArtisteDialog = ({
  open,
  onOpenChange,
  artiste,
  onSuccess,
}: AddEditDialogProps) => {
  const [name, setName] = useState("");
  const [styles, setStyles] = useState("");
  const [country, setCountry] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (artiste) {
      setName(artiste.fields.Name || "");
      setStyles(artiste.fields.styles?.join(", ") || "");
      setCountry("");
      setGenre("");
    } else {
      setName("");
      setStyles("");
      setCountry("");
      setGenre("");
    }
  }, [artiste, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const stylesArray = styles
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const fields: any = {
        Name: name,
        styles: stylesArray,
      };

      if (country) fields.Country = country;
      if (genre) fields.Genre = genre;

      const { data, error } = await supabase.functions.invoke('airtable-proxy', {
        body: {
          method: artiste ? 'PATCH' : 'POST',
          table: 'Artistes',
          recordId: artiste?.id,
          fields
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Succès",
        description: artiste
          ? "Artiste modifié avec succès"
          : "Artiste créé avec succès",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {artiste ? "Modifier l'artiste" : "Ajouter un artiste"}
          </DialogTitle>
          <DialogDescription>
            {artiste
              ? "Modifiez les informations de l'artiste"
              : "Remplissez les informations du nouvel artiste"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de l'artiste"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="styles">
                Styles <span className="text-muted-foreground text-sm">(séparés par des virgules)</span>
              </Label>
              <Input
                id="styles"
                value={styles}
                onChange={(e) => setStyles(e.target.value)}
                placeholder="Techno, House, Trance"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="France"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Electronic"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {artiste ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artiste: Artistes | null;
  onSuccess: () => void;
}

export const DeleteArtisteDialog = ({
  open,
  onOpenChange,
  artiste,
  onSuccess,
}: DeleteDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!artiste) return;
    setLoading(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase.functions.invoke('airtable-proxy', {
        body: {
          method: 'DELETE',
          table: 'Artistes',
          recordId: artiste.id
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Succès",
        description: "Artiste supprimé avec succès",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'artiste{" "}
            <span className="font-semibold">{artiste?.fields.Name}</span> ? Cette
            action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
