import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Database, RefreshCw, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Bucket {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
}

const BucketManagement = () => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Create dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [newBucketPublic, setNewBucketPublic] = useState(true);

  // Edit dialog
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);
  const [editBucketPublic, setEditBucketPublic] = useState(true);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBucket, setDeletingBucket] = useState<Bucket | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  useEffect(() => {
    loadBuckets();
  }, []);

  const callManageBuckets = async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Non authentifié");

    const response = await supabase.functions.invoke("manage-buckets", {
      body,
    });

    if (response.error) throw response.error;
    if (response.data?.error) throw new Error(response.data.error);
    return response.data;
  };

  const loadBuckets = async () => {
    setLoading(true);
    try {
      const data = await callManageBuckets({ action: "list" });
      setBuckets(data.buckets || []);
    } catch (error: any) {
      console.error("Error loading buckets:", error);
      toast.error("Erreur lors du chargement des buckets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newBucketName.trim()) {
      toast.error("Le nom du bucket est requis");
      return;
    }
    const sanitized = newBucketName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setActionLoading(true);
    try {
      await callManageBuckets({
        action: "create",
        bucketName: sanitized,
        isPublic: newBucketPublic,
      });
      toast.success(`Bucket "${sanitized}" créé avec succès`);
      setShowCreateDialog(false);
      setNewBucketName("");
      setNewBucketPublic(true);
      loadBuckets();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingBucket) return;
    setActionLoading(true);
    try {
      await callManageBuckets({
        action: "update",
        bucketName: editingBucket.id,
        newBucketName: editingBucket.id,
        isPublic: editBucketPublic,
      });
      toast.success(`Bucket "${editingBucket.name}" mis à jour`);
      setShowEditDialog(false);
      setEditingBucket(null);
      loadBuckets();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBucket) return;
    if (deleteConfirmName !== deletingBucket.name) {
      toast.error("Le nom ne correspond pas");
      return;
    }
    setActionLoading(true);
    try {
      await callManageBuckets({
        action: "delete",
        bucketName: deletingBucket.id,
      });
      toast.success(`Bucket "${deletingBucket.name}" supprimé avec toutes ses images`);
      setShowDeleteDialog(false);
      setDeletingBucket(null);
      setDeleteConfirmName("");
      loadBuckets();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setEditBucketPublic(bucket.public);
    setShowEditDialog(true);
  };

  const openDelete = (bucket: Bucket) => {
    setDeletingBucket(bucket);
    setDeleteConfirmName("");
    setShowDeleteDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gestion des Buckets de Stockage
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadBuckets} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau Bucket
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : buckets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucun bucket trouvé</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {buckets.map((bucket) => (
              <div
                key={bucket.id}
                className="border rounded-lg p-4 flex flex-col gap-2 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{bucket.name}</span>
                  <Badge variant={bucket.public ? "default" : "secondary"} className="text-xs flex items-center gap-1">
                    {bucket.public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {bucket.public ? "Public" : "Privé"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Créé le {new Date(bucket.created_at).toLocaleDateString("fr-FR")}
                </div>
                <div className="flex gap-1 mt-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(bucket)}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDelete(bucket)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau Bucket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nom du bucket</Label>
              <Input
                placeholder="mon-bucket"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Lettres minuscules, chiffres et tirets uniquement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newBucketPublic}
                onCheckedChange={setNewBucketPublic}
              />
              <Label>Accès public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={actionLoading}>
              {actionLoading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le bucket "{editingBucket?.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Note : Le renommage de bucket n'est pas supporté par Supabase. Vous pouvez modifier la visibilité.
            </p>
            <div className="flex items-center gap-2">
              <Switch
                checked={editBucketPublic}
                onCheckedChange={setEditBucketPublic}
              />
              <Label>{editBucketPublic ? "Public" : "Privé"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={actionLoading}>
              {actionLoading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ⚠️ Supprimer le bucket "{deletingBucket?.name}" ?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold text-destructive">
                ATTENTION : Cette action est irréversible !
              </p>
              <p>
                Toutes les images contenues dans ce bucket seront définitivement supprimées.
                Les liens vers ces images ne fonctionneront plus.
              </p>
              <p>
                Pour confirmer, tapez le nom du bucket : <strong>{deletingBucket?.name}</strong>
              </p>
              <Input
                placeholder={deletingBucket?.name}
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmName("")}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading || deleteConfirmName !== deletingBucket?.name}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? "Suppression..." : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default BucketManagement;
