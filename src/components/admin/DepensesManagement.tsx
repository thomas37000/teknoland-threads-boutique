
import React, { useState, useEffect } from "react";
import { DepenseMois } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import DepensesTable from "./DepensesTable";
import { AddDepenseDialog, EditDepenseDialog } from "./DepensesDialogs";

const DepensesManagement = () => {
  const [depenses, setDepenses] = useState<DepenseMois[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDepense, setEditingDepense] = useState<DepenseMois | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [depenseToDelete, setDepenseToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDepenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("depenses_mois")
        .select("*")
        .order("annee", { ascending: false });

      if (error) throw error;
      setDepenses(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des dépenses:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des dépenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepenses();
  }, []);

  const handleEdit = (depense: DepenseMois) => {
    setEditingDepense(depense);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDepenseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!depenseToDelete) return;

    try {
      const { error } = await supabase
        .from("depenses_mois")
        .delete()
        .eq("id", depenseToDelete);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Dépense supprimée avec succès",
      });

      await fetchDepenses();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la dépense",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDepenseToDelete(null);
    }
  };

  const calculateStats = () => {
    const totalExpenses = depenses.reduce((sum, depense) => sum + depense.total, 0);
    const averagePerYear = depenses.length > 0 ? totalExpenses / depenses.length : 0;
    const totalWeeklyAverage = depenses.reduce((sum, depense) => sum + depense.semaine_moyenne, 0);

    return {
      totalExpenses,
      averagePerYear,
      totalWeeklyAverage,
      yearsCount: depenses.length,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des dépenses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total des dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(stats.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moyenne par année
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(stats.averagePerYear)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moyenne hebdomadaire totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(stats.totalWeeklyAverage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Années enregistrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.yearsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des Dépenses Mensuelles - Moni</CardTitle>
            <AddDepenseDialog onDepenseAdded={fetchDepenses} />
          </div>
        </CardHeader>
        <CardContent>
          <DepensesTable
            depenses={depenses}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditDepenseDialog
        depense={editingDepense}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onDepenseUpdated={fetchDepenses}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepensesManagement;
