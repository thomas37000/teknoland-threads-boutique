
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import PopupAdmin from "./PopupAdmin";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
    display_order: 0
  });

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive"
        });
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
        variant: "destructive"
      });
      return;
    }

    try {
      const categoryData = {
        name: newCategory.name,
        slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        description: newCategory.description || null,
        is_active: newCategory.is_active,
        display_order: newCategory.display_order || categories.length + 1,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la catégorie",
          variant: "destructive"
        });
        return;
      }

      setCategories([...categories, data]);
      setNewCategory({
        name: "",
        slug: "",
        description: "",
        is_active: true,
        display_order: 0
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Catégorie ajoutée",
        description: `${data.name} a été ajoutée avec succès`
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEditCategory = async () => {
    if (!currentCategory) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: currentCategory.name,
          slug: currentCategory.slug,
          description: currentCategory.description || null,
          is_active: currentCategory.is_active,
          display_order: currentCategory.display_order
        })
        .eq('id', currentCategory.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier la catégorie",
          variant: "destructive"
        });
        return;
      }

      const updatedCategories = categories.map(cat => 
        cat.id === currentCategory.id ? data : cat
      );
      setCategories(updatedCategories);
      setIsEditDialogOpen(false);
      setCurrentCategory(null);

      toast({
        title: "Catégorie modifiée",
        description: "Les modifications ont été sauvegardées"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleCategoryStatus = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling category status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier le statut de la catégorie",
          variant: "destructive"
        });
        return;
      }

      const updatedCategories = categories.map(cat => 
        cat.id === categoryId ? data : cat
      );
      setCategories(updatedCategories);

      toast({
        title: data.is_active ? "Catégorie activée" : "Catégorie désactivée",
        description: `${data.name} est maintenant ${data.is_active ? 'visible' : 'cachée'} sur la boutique`
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la catégorie",
          variant: "destructive"
        });
        return;
      }

      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);

      toast({
        title: "Catégorie supprimée",
        description: `${category.name} a été supprimée`
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tekno-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Catégories</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      <PopupAdmin
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Ajouter une nouvelle catégorie"
        maxWidth="w-96"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la catégorie</Label>
            <Input
              id="name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              placeholder="Ex: T-Shirts Premium"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={newCategory.slug}
              onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
              placeholder="Ex: t-shirts-premium"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              placeholder="Description de la catégorie"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={newCategory.is_active}
              onCheckedChange={(checked) => setNewCategory({...newCategory, is_active: checked})}
            />
            <Label htmlFor="is_active">Catégorie active</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddCategory} className="flex-1">Ajouter</Button>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">Annuler</Button>
          </div>
        </div>
      </PopupAdmin>

      <Card>
        <CardHeader>
          <CardTitle>Catégories existantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {category.is_active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={category.is_active ? "text-green-600" : "text-gray-400"}>
                        {category.is_active ? "Visible" : "Cachée"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryStatus(category.id)}
                      >
                        {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentCategory(category);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PopupAdmin
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifier la catégorie"
        maxWidth="w-96"
      >
        {currentCategory && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom de la catégorie</Label>
              <Input
                id="edit-name"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug (URL)</Label>
              <Input
                id="edit-slug"
                value={currentCategory.slug}
                onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={currentCategory.description || ""}
                onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEditCategory} className="flex-1">Sauvegarder</Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">Annuler</Button>
            </div>
          </div>
        )}
      </PopupAdmin>
    </div>
  );
};

export default CategoryManagement;
