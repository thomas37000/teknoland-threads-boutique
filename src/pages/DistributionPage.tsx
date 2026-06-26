import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistributorAccess } from "@/hooks/use-distributor-access";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Loader2, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

interface VinyleFields {
  Ref?: string;
  Titre?: string;
  Stock?: number;
  Date_de_sortie?: string;
  Image?: Array<{ url: string; thumbnails?: { small?: { url: string } } }> | string;
  Prix_distributeur?: number;
  Format?: string;
  Styles?: string[] | string;
  Artistes?: string[] | string;
  [k: string]: any;
}

interface VinyleRecord {
  id: string;
  fields: VinyleFields;
}

const EMPTY: VinyleFields = {
  Ref: "",
  Titre: "",
  Stock: 0,
  Date_de_sortie: "",
  Prix_distributeur: 0,
  Format: "",
  Styles: "",
  Artistes: "",
};

const formatList = (v: any): string => {
  if (!v) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
};

const firstImage = (img: VinyleFields["Image"]): string | null => {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (Array.isArray(img) && img.length > 0) {
    return img[0]?.thumbnails?.small?.url || img[0]?.url || null;
  }
  return null;
};

const DistributionPage = () => {
  const { isAdmin } = useDistributorAccess();
  const { toast } = useToast();
  const [records, setRecords] = useState<VinyleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<VinyleRecord | null>(null);
  const [form, setForm] = useState<VinyleFields>(EMPTY);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<VinyleRecord | null>(null);

  const [manageOpen, setManageOpen] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("airtable-proxy", {
        body: { method: "GET", table: "Vinyles" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Erreur Airtable");
      setRecords(data?.records || []);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de charger les vinyles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const f = r.fields;
      return (
        f.Ref?.toLowerCase().includes(q) ||
        f.Titre?.toLowerCase().includes(q) ||
        formatList(f.Artistes).toLowerCase().includes(q) ||
        formatList(f.Styles).toLowerCase().includes(q) ||
        f.Format?.toLowerCase().includes(q)
      );
    });
  }, [records, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setEditOpen(true);
  };

  const openEdit = (r: VinyleRecord) => {
    setEditing(r);
    setForm({
      Ref: r.fields.Ref || "",
      Titre: r.fields.Titre || "",
      Stock: r.fields.Stock ?? 0,
      Date_de_sortie: r.fields.Date_de_sortie || "",
      Prix_distributeur: r.fields.Prix_distributeur ?? 0,
      Format: r.fields.Format || "",
      Styles: formatList(r.fields.Styles),
      Artistes: formatList(r.fields.Artistes),
    });
    setEditOpen(true);
  };

  const buildFields = (): Record<string, any> => {
    const fields: Record<string, any> = {
      Ref: form.Ref || undefined,
      Titre: form.Titre || undefined,
      Stock: form.Stock !== undefined && form.Stock !== null && `${form.Stock}` !== "" ? Number(form.Stock) : undefined,
      Date_de_sortie: form.Date_de_sortie || undefined,
      Prix_distributeur:
        form.Prix_distributeur !== undefined && `${form.Prix_distributeur}` !== ""
          ? Number(form.Prix_distributeur)
          : undefined,
      Format: form.Format || undefined,
    };
    // Styles & Artistes likely are multi-select / linked. Send as array when comma-separated.
    const styles = typeof form.Styles === "string" ? form.Styles : formatList(form.Styles);
    if (styles) {
      fields.Styles = styles.split(",").map((s) => s.trim()).filter(Boolean);
    }
    const artistes = typeof form.Artistes === "string" ? form.Artistes : formatList(form.Artistes);
    if (artistes) {
      fields.Artistes = artistes.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return fields;
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    try {
      setSaving(true);
      const fields = buildFields();
      const body: any = editing
        ? { method: "PATCH", table: "Vinyles", recordId: editing.id, fields }
        : { method: "POST", table: "Vinyles", fields };
      const { data, error } = await supabase.functions.invoke("airtable-proxy", { body });
      if (error) throw error;
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
      toast({ title: editing ? "Vinyle modifié" : "Vinyle ajouté" });
      setEditOpen(false);
      fetchRecords();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Échec de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !toDelete) return;
    try {
      setSaving(true);
      const { data, error } = await supabase.functions.invoke("airtable-proxy", {
        body: { method: "DELETE", table: "Vinyles", recordId: toDelete.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Erreur");
      toast({ title: "Vinyle supprimé" });
      setDeleteOpen(false);
      setToDelete(null);
      fetchRecords();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Échec de la suppression",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tekno-container py-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <CardTitle>Distribution — Vinyles</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchRecords} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Rafraîchir
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" onClick={() => setManageOpen(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Distributeurs
                  </Button>
                  <Button onClick={openAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un vinyle
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-sm">
            <Input
              placeholder="Rechercher (ref, titre, artiste, style...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <TableSkeleton rows={8} columns={isAdmin ? 10 : 9} />
          ) : (
            <div className="overflow-x-auto">
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Ref</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Artistes</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Styles</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Prix dist.</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 10 : 9} className="text-center py-6 text-muted-foreground">
                        Aucun vinyle trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => {
                      const img = firstImage(r.fields.Image);
                      return (
                        <TableRow key={r.id}>
                          <TableCell>
                            {img ? (
                              <img src={img} alt={r.fields.Titre || "Vinyle"} className="h-12 w-12 object-cover rounded" />
                            ) : (
                              <div className="h-12 w-12 bg-muted rounded" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{r.fields.Ref}</TableCell>
                          <TableCell className="font-medium">{r.fields.Titre}</TableCell>
                          <TableCell>{formatList(r.fields.Artistes)}</TableCell>
                          <TableCell>{r.fields.Format}</TableCell>
                          <TableCell>{formatList(r.fields.Styles)}</TableCell>
                          <TableCell>{r.fields.Date_de_sortie}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={(r.fields.Stock ?? 0) > 0 ? "default" : "secondary"}>
                              {r.fields.Stock ?? 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {r.fields.Prix_distributeur != null ? `${r.fields.Prix_distributeur} €` : "—"}
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setToDelete(r);
                                    setDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le vinyle" : "Ajouter un vinyle"}</DialogTitle>
            <DialogDescription>
              Les modifications sont synchronisées directement avec la table Airtable « Vinyles ».
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ref</Label>
              <Input value={form.Ref || ""} onChange={(e) => setForm({ ...form, Ref: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={form.Titre || ""} onChange={(e) => setForm({ ...form, Titre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Artistes (séparés par des virgules)</Label>
              <Input
                value={typeof form.Artistes === "string" ? form.Artistes : formatList(form.Artistes)}
                onChange={(e) => setForm({ ...form, Artistes: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Input value={form.Format || ""} onChange={(e) => setForm({ ...form, Format: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Styles (séparés par des virgules)</Label>
              <Input
                value={typeof form.Styles === "string" ? form.Styles : formatList(form.Styles)}
                onChange={(e) => setForm({ ...form, Styles: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de sortie</Label>
              <Input
                type="date"
                value={form.Date_de_sortie || ""}
                onChange={(e) => setForm({ ...form, Date_de_sortie: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                value={form.Stock ?? 0}
                onChange={(e) => setForm({ ...form, Stock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix distributeur (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.Prix_distributeur ?? 0}
                onChange={(e) => setForm({ ...form, Prix_distributeur: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le vinyle</DialogTitle>
            <DialogDescription>
              Confirmer la suppression de « {toDelete?.fields.Titre} » ? Cette action est définitive sur Airtable.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <ManageDistributorsDialog open={manageOpen} onOpenChange={setManageOpen} />
      )}
    </div>
  );
};

/* -------- Manage distributors (admin only) -------- */

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

const ManageDistributorsDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [distributorIds, setDistributorIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: profs, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name").order("email", { ascending: true }),
        supabase.from("user_roles").select("user_id, role").eq("role", "distributor" as any),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setProfiles((profs as ProfileRow[]) || []);
      setDistributorIds(new Set(((roles as any[]) || []).map((r) => r.user_id)));
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const toggle = async (userId: string, currently: boolean) => {
    setBusyId(userId);
    try {
      if (currently) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "distributor" as any);
        if (error) throw error;
        const next = new Set(distributorIds);
        next.delete(userId);
        setDistributorIds(next);
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "distributor" as any });
        if (error) throw error;
        const next = new Set(distributorIds);
        next.add(userId);
        setDistributorIds(next);
      }
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Échec de la mise à jour du rôle",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const filtered = profiles.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (p.email || "").toLowerCase().includes(q) || (p.full_name || "").toLowerCase().includes(q);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gérer les distributeurs</DialogTitle>
          <DialogDescription>
            Accorde ou retire l'accès à la page Distribution pour chaque utilisateur.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Rechercher par email ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <div className="max-h-[50vh] overflow-y-auto border rounded">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Aucun utilisateur</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const is = distributorIds.has(p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{p.email || "—"}</TableCell>
                      <TableCell className="text-sm">{p.full_name || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={is ? "destructive" : "default"}
                          disabled={busyId === p.id}
                          onClick={() => toggle(p.id, is)}
                        >
                          {busyId === p.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {is ? "Retirer" : "Ajouter"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DistributionPage;