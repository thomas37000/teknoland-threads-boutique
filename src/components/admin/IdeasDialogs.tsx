import { useEffect } from "react";
import PopupAdmin from "./PopupAdmin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Idea } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface IdeasDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  newIdea: Partial<Idea>;
  setNewIdea: (Idea: Partial<Idea>) => void;
  currentIdea: Idea | null;
  setCurrentIdea: (Idea: Idea | null) => void;
  handleAddIdea: () => void;
  handleEditIdea: () => void;
  handleDeleteIdea: () => void;
}

const handleAddIdeaWithSupabase = async (newIdea: Partial<Idea>, handleAddIdea: () => void, setIsAddDialogOpen: (open: boolean) => void) => {
  if (!newIdea.desc || !newIdea.priority || !newIdea.cat_ideas) {
    toast({
      title: "Erreur",
      description: "Veuillez remplir tous les champs requis.",
      variant: "destructive"
    });
    return;
  }

  try {
    const { error } = await supabase
      .from('ideas')
      .insert([{
        desc: newIdea.desc,
        priority: newIdea.priority,
        cat_ideas: newIdea.cat_ideas
      }]);

    if (error) throw error;

    // Show success message
    toast({
      title: "Idée ajoutée",
      description: "L'idée a été ajoutée avec succès."
    });

    // close Add dialog
    setIsAddDialogOpen(false);
    handleAddIdea();
  } catch (error) {
    console.error("Error adding idea:", error);
    toast({
      title: "Erreur",
      description: "Impossible d'ajouter l'idée. Veuillez réessayer.",
      variant: "destructive"
    });
  }
};

const handleEditIdeaWithSupabase = async (currentIdea: Idea | null, handleEditIdea: () => void, setIsEditDialogOpen: (open: boolean) => void) => {
  if (!currentIdea || !currentIdea.desc || !currentIdea.priority || !currentIdea.cat_ideas) {
    toast({
      title: "Erreur",
      description: "Veuillez remplir tous les champs requis.",
      variant: "destructive"
    });
    return;
  }

  try {
    const { error } = await supabase
      .from('ideas')
      .update({
        desc: currentIdea.desc,
        priority: currentIdea.priority,
        cat_ideas: currentIdea.cat_ideas
      })
      .eq('id', currentIdea.id);

    if (error) throw error;

    toast({
      title: "Idée modifiée",
      description: "L'idée a été modifiée avec succès."
    });

    // close Edit dialog
    setIsEditDialogOpen(false);
    handleEditIdea();
  } catch (error) {
    console.error("Error updating idea:", error);
    toast({
      title: "Erreur",
      description: "Impossible de modifier l'idée. Veuillez réessayer.",
      variant: "destructive"
    });
  }
};

const IdeasDialogs = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  newIdea,
  setNewIdea,
  currentIdea,
  setCurrentIdea,
  handleAddIdea,
  handleEditIdea,
  handleDeleteIdea,
}: IdeasDialogsProps) => {
  useEffect(() => {  // Reset Add form onClose
    if (!isAddDialogOpen) {
      setNewIdea({ desc: "", priority: "medium", cat_ideas: "Shop" });
    }
  }, [isAddDialogOpen]);

  return (
    <>
      {/* Add Idea Dialog */}
      <PopupAdmin
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Ajouter une nouvelle idée"
        maxWidth="max-w-2xl"
      >
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Description
            </Label>
            <Textarea
              id="name"
              value={newIdea.desc || ""}
              onChange={(e) =>
                setNewIdea({ ...newIdea, desc: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priorité
            </Label>
            <Select
              value={newIdea.priority || "medium"}
              onValueChange={(value) =>
                setNewIdea({ ...newIdea, priority: value as 'low' | 'medium' | 'high' | 'urgent' })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez une priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cat_ideas" className="text-right">
              Catégorie
            </Label>
            <Select
              value={newIdea.cat_ideas || "Shop"}
              onValueChange={(value) =>
                setNewIdea({ ...newIdea, cat_ideas: value as 'Shop' | 'Label' | 'Graphisme' | 'Dev' | 'Primitik' | 'Supabase' | 'Youtube' })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shop">Shop</SelectItem>
                <SelectItem value="Label">Label</SelectItem>
                <SelectItem value="Graphisme">Graphisme</SelectItem>
                <SelectItem value="Dev">Dev</SelectItem>
                <SelectItem value="Primitik">Primitik</SelectItem>
                <SelectItem value="Supabase">Supabase</SelectItem>
                <SelectItem value="Youtube">Youtube</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
            Annuler
          </Button>
          <Button onClick={() => handleAddIdeaWithSupabase(newIdea, handleAddIdea, setIsAddDialogOpen)} className="flex-1">
            Ajouter l'idée
          </Button>
        </div>
      </PopupAdmin>

      {/* Edit Idea Dialog */}
      <PopupAdmin
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifier l'idée"
        maxWidth="max-w-2xl"
      >
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Description
            </Label>
            <Input
              id="edit-name"
              value={currentIdea?.desc || ""}
              onChange={(e) =>
                setCurrentIdea(
                  currentIdea
                    ? { ...currentIdea, desc: e.target.value }
                    : null
                )
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-priority" className="text-right">
              Priorité
            </Label>
            <Select
              value={currentIdea?.priority || "medium"}
              onValueChange={(value) =>
                setCurrentIdea(
                  currentIdea
                    ? { ...currentIdea, priority: value as 'low' | 'medium' | 'high' | 'urgent' }
                    : null
                )
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez une priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-cat_ideas" className="text-right">
              Catégorie
            </Label>
            <Select
              value={currentIdea?.cat_ideas || "Shop"}
              onValueChange={(value) =>
                setCurrentIdea({ ...currentIdea, cat_ideas: value as 'Shop' | 'Label' | 'Graphisme' | 'Dev' | 'Primitik' | 'Supabase' | 'Youtube' })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shop">Shop</SelectItem>
                <SelectItem value="Label">Label</SelectItem>
                <SelectItem value="Graphisme">Graphisme</SelectItem>
                <SelectItem value="Dev">Dev</SelectItem>
                <SelectItem value="Primitik">Primitik</SelectItem>
                <SelectItem value="Supabase">Supabase</SelectItem>
                <SelectItem value="Youtube">Youtube</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
            Annuler
          </Button>
          <Button onClick={() => handleEditIdeaWithSupabase(currentIdea, handleEditIdea, setIsEditDialogOpen)} className="flex-1">
            Sauvegarder
          </Button>
        </div>
      </PopupAdmin>

      {/* Delete Idea Dialog */}
      <PopupAdmin
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Supprimer l'idée"
      >
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer "{currentIdea?.desc}" ? Cette action ne peut pas être
          annulée.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDeleteIdea} className="flex-1">
            Supprimer
          </Button>
        </div>
      </PopupAdmin>
    </>
  );
};

export default IdeasDialogs;
