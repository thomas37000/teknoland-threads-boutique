import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Idea } from "@/types";
import IdeasTable from "./IdeasTable";
import IdeasDialogs from "./IdeasDialogs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IdeasManagementProps {
  initialIdeas: Idea[];
}


const IdeasManagement = ({ initialIdeas }: IdeasManagementProps) => {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [newIdea, setNewIdea] = useState<Partial<Idea>>({
    desc: "",
    priority: "medium" as const,
    cat_ideas: ""
  });

  // Fetch Ideas from Supabase
  useEffect(() => {
    const fetchIdeas = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to match the Ideas interface
          const transformedData: Idea[] = data.map(item => ({
            ...item
          }));
          
          setIdeas(transformedData);
        }
      } catch (error) {
        console.error("Error fetching Ideas:", error);
        toast({
          title: "Error",
          description: "Failed to load Ideas",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, []);
  
  
  // Apply filters when dependencies change
  useEffect(() => {
    let result = [...ideas];
    
    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        idea => 
          idea.desc.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(idea => idea.cat_ideas === categoryFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter(idea => idea.priority === priorityFilter);
    }

    setFilteredIdeas(result);
  }, [ideas, searchQuery, categoryFilter, priorityFilter]);
  
  const handleAddIdeas = async () => {
    // The actual adding to Supabase is now handled in IdeasDialogs.tsx
    // This function is now just to refresh the Ideas list
    try {
      const { data, error } = await supabase.from('ideas').select('*');
      if (error) throw error;
      if (data) {
        // Transform the data to match the Ideas interface
        const transformedData: Idea[] = data.map(item => ({
          ...item
        }));
        
        setIdeas(transformedData);
      }
    } catch (error) {
      console.error("Error refreshing Ideas:", error);
    }
  };

  const handleEditIdeas = async () => {
    // The actual updating in Supabase is now handled in IdeasDialogs.tsx
    // This function is now just to refresh the Ideas list
    try {
      const { data, error } = await supabase.from('ideas').select('*');
      if (error) throw error;
      console.log(data)
      if (data) {
        // Transform the data to match the Ideas interface
        const transformedData: Idea[] = data.map(item => ({
          ...item
        }));
        
        setIdeas(transformedData);
      }
    } catch (error) {
      console.error("Error refreshing Ideas after edit:", error);
    }
  };

  const handleDeleteIdeas = async () => {
    if (!currentIdea) return;
    
    try {
      // Delete the Ideas from Supabase
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', currentIdea.id);
        
      if (error) throw error;
      
      // Update local state to remove the Ideas
      setIdeas(ideas.filter((p) => p.id !== currentIdea.id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Idées supprimées",
        description: `${currentIdea.desc} a été supprimée avec succès.`
      });
    } catch (error) {
      console.error("Error deleting Ideas:", error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression des idées. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (ideas: Idea) => {
    setCurrentIdea(ideas);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (ideas: Idea) => {
    setCurrentIdea(ideas);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gérer les idées</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une idée
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher des idées..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="Shop">Shop</SelectItem>
            <SelectItem value="UI/UX">UI/UX</SelectItem>
            <SelectItem value="Backend">Backend</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les priorités</SelectItem>
            <SelectItem value="low">Faible</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="high">Élevée</SelectItem>
          </SelectContent>
        </Select>
      </div>
          
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Chargement des idées...</p>
        </div>
      ) : (
        <IdeasTable 
          ideas={filteredIdeas} 
          openEditDialog={openEditDialog}
          openDeleteDialog={openDeleteDialog}
        />
      )}

      <IdeasDialogs 
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        newIdea={newIdea}
        setNewIdea={setNewIdea}
        currentIdea={currentIdea}
        setCurrentIdea={setCurrentIdea}
        handleAddIdea={handleAddIdeas}
        handleEditIdea={handleEditIdeas}
        handleDeleteIdea={handleDeleteIdeas}
      />
    </div>
  );
};

export default IdeasManagement;
