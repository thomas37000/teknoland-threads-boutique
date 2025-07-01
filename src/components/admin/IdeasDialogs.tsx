
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  setCurrentIdea: (Idea: Idea| null) => void;
  handleAddIdea: () => void;
  handleEditIdea: () => void;
  handleDeleteIdea: () => void;
}

const handleAddIdeaWithSupabase = async (newIdea: Partial<Idea>, handleAddIdea: () => void, setIsAddDialogOpen: (open: boolean) => void) => {
  if (!newIdea.desc || !newIdea.priority) {
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
        priority: newIdea.priority
      }]);

    if (error) throw error;

    toast({
      title: "Idée ajoutée",
      description: "L'idée a été ajoutée avec succès."
    });

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
  if (!currentIdea || !currentIdea.desc || !currentIdea.priority) {
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
        priority: currentIdea.priority
      })
      .eq('id', currentIdea.id);

    if (error) throw error;

    toast({
      title: "Idée modifiée",
      description: "L'idée a été modifiée avec succès."
    });

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
  return (
    <>
      {/* Add Idea Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle idée</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Description
              </Label>
              <Input
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => handleAddIdeaWithSupabase(newIdea, handleAddIdea, setIsAddDialogOpen)}>
              Ajouter l'idée
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Idea Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'idée</DialogTitle>
          </DialogHeader>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => handleEditIdeaWithSupabase(currentIdea, handleEditIdea, setIsEditDialogOpen)}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Idea Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'idée</DialogTitle>
          </DialogHeader>
          <p>
            Êtes-vous sûr de vouloir supprimer "{currentIdea?.desc}" ? Cette action ne peut pas être
            annulée.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteIdea}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IdeasDialogs;
