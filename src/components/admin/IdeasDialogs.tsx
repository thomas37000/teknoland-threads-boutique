
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
import { Ideas } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface IdeasDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  newIdea: Partial<Ideas>;
  setNewIdea: (Idea: Partial<Ideas>) => void;
  currentIdea: Ideas | null;
  setCurrentIdea: (Idea: Ideas| null) => void;
  handleAddIdea: () => void;
  handleEditIdea: () => void;
  handleDeleteIdea: () => void;
}

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
            <DialogTitle>Add New Idea</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newIdea.name || ""}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddIdea}>Add Idea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Idea Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={currentIdea?.name || ""}
                onChange={(e) =>
                  setCurrentIdea(
                    currentIdea
                      ? { ...currentIdea, name: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditIdea}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Idea Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Idea</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{currentIdea?.name}"? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteIdea}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IdeasDialogs;
