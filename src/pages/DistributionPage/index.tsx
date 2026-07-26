import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistributorAccess } from "@/hooks/use-distributor-access";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Users } from "lucide-react";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

import { EMPTY_VINYLE } from "./types";
import type { PriceSort, VinyleFields, VinyleRecord } from "./types";
import { formatList, firstImage, toIdArray } from "./utils";
import { useVinylesData } from "./hooks/useVinylesData";
import { VinyleTable } from "./components/VinyleTable";
import { VinyleFormDialog } from "./components/VinyleFormDialog";
import { DeleteVinyleDialog } from "./components/DeleteVinyleDialog";
import { ManageDistributorsDialog } from "./components/ManageDistributorsDialog";

/**
 * Page « Distribution » — vue admin/distributeur des vinyles Airtable.
 *
 * Responsabilités :
 * - Chargement des vinyles + artistes via `useVinylesData` (edge `airtable-proxy`).
 * - Recherche, tri (prix distributeur) et groupement (Teknoland > Echange > autres).
 * - Panier local (quantité par record) et ajout au panier global (checkout Stripe
 *   déclenché depuis la page Panier, cf. `create-vinyle-checkout`).
 * - CRUD Airtable réservé aux admins + gestion des rôles `distributor`.
 */
const DistributionPage = () => {
  const { isAdmin } = useDistributorAccess();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { records, artistes, loading, refetch } = useVinylesData();

  const [search, setSearch] = useState("");
  const [priceSort, setPriceSort] = useState<PriceSort>("none");

  // Panier local (recordId -> quantité) avant ajout au panier global.
  const [qty, setQty] = useState<Record<string, number>>({});
  const getQty = (id: string) => qty[id] ?? 1;
  const bumpQty = (id: string, delta: number, max: number) =>
    setQty((q) => ({
      ...q,
      [id]: Math.max(1, Math.min(max || 99, (q[id] ?? 1) + delta)),
    }));

  // Dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<VinyleRecord | null>(null);
  const [form, setForm] = useState<VinyleFields>(EMPTY_VINYLE);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<VinyleRecord | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

  // Résolution record ID -> nom d'artiste pour l'affichage.
  const artisteMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of artistes) m.set(a.id, a.fields?.Name || a.id);
    return m;
  }, [artistes]);

  const resolveArtistes = (v: any): string => {
    const ids = toIdArray(v);
    if (ids.length === 0) return "";
    return ids.map((id) => artisteMap.get(id) || id).join(", ");
  };

  // Filtre + groupement + tri de la liste affichée.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Ne conserver que les vinyles dont le statut Stock est "En stock".
    const visible = records.filter((r) => {
      const status = String(r.fields.Stock ?? "").trim().toLowerCase();
      return status === "en stock";
    });
    const base = !q
      ? visible
      : visible.filter((r) => {
          const f = r.fields;
          return (
            f.Ref?.toLowerCase().includes(q) ||
            f.Titre?.toLowerCase().includes(q) ||
            resolveArtistes(f.Artistes).toLowerCase().includes(q) ||
            formatList(f.Styles).toLowerCase().includes(q) ||
            f.Format?.toLowerCase().includes(q)
          );
        });
    // Groupe : 0 = Label Teknoland Production, 1 = case Echange, 2 = autres.
    const groupOf = (r: VinyleRecord): number => {
      const label = String(r.fields.Label ?? "").trim().toLowerCase();
      if (label === "teknoland production") return 0;
      const ex = r.fields.Echange;
      const isEchange =
        ex === true ||
        ex === 1 ||
        (typeof ex === "string" &&
          ["true", "1", "oui", "yes", "checked"].includes(ex.toLowerCase()));
      if (isEchange) return 1;
      return 2;
    };
    const arr = [...base];
    arr.sort((a, b) => {
      const ga = groupOf(a);
      const gb = groupOf(b);
      if (ga !== gb) return ga - gb;
      if (priceSort !== "none") {
        const pa = Number(a.fields.Prix_distributeur ?? 0);
        const pb = Number(b.fields.Prix_distributeur ?? 0);
        return priceSort === "asc" ? pa - pb : pb - pa;
      }
      return 0;
    });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, search, artisteMap, priceSort]);

  // Ajout au panier global : le checkout Stripe est déclenché plus tard, depuis
  // la page Panier (icône caddie de la nav). On marque `itemType: 'vinyle'` et
  // `externalRef` pour router vers `create-vinyle-checkout`.
  const addVinyleToCart = (r: VinyleRecord) => {
    const quantity = getQty(r.id);
    const f = r.fields;
    const price = Number(f.Prix_distributeur ?? 0);
    const img = firstImage(f.Image) || "";
    const name = `${f.Ref ? f.Ref + " — " : ""}${f.Titre || "Vinyle"}`;
    addToCart(
      {
        id: `vinyle:${r.id}`,
        name,
        price,
        image: img,
        itemType: "vinyle",
        externalRef: r.id,
      },
      quantity,
    );
    toast({ title: "Ajouté au panier", description: `${quantity} × ${name}` });
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_VINYLE);
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
      Artistes: toIdArray(r.fields.Artistes),
    });
    setEditOpen(true);
  };

  /**
   * Construit le payload Airtable à partir de l'état du formulaire.
   * `Styles` est un multi-select → tableau. `Artistes` est un linked record →
   * on filtre pour ne conserver que les IDs valides (`rec...`).
   */
  const buildFields = (): Record<string, any> => {
    const fields: Record<string, any> = {
      Ref: form.Ref || undefined,
      Titre: form.Titre || undefined,
      Stock:
        form.Stock !== undefined &&
        form.Stock !== null &&
        `${form.Stock}` !== ""
          ? Number(form.Stock)
          : undefined,
      Date_de_sortie: form.Date_de_sortie || undefined,
      Prix_distributeur:
        form.Prix_distributeur !== undefined &&
        `${form.Prix_distributeur}` !== ""
          ? Number(form.Prix_distributeur)
          : undefined,
      Format: form.Format || undefined,
    };
    const styles =
      typeof form.Styles === "string" ? form.Styles : formatList(form.Styles);
    if (styles) {
      fields.Styles = styles
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    fields.Artistes = toIdArray(form.Artistes).filter((id) =>
      id.startsWith("rec"),
    );
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
      const { data, error } = await supabase.functions.invoke(
        "airtable-proxy",
        { body },
      );
      if (error) throw error;
      if (data?.error)
        throw new Error(
          typeof data.error === "string" ? data.error : JSON.stringify(data.error),
        );
      toast({ title: editing ? "Vinyle modifié" : "Vinyle ajouté" });
      setEditOpen(false);
      refetch();
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
      const { data, error } = await supabase.functions.invoke(
        "airtable-proxy",
        {
          body: { method: "DELETE", table: "Vinyles", recordId: toDelete.id },
        },
      );
      if (error) throw error;
      if (data?.error)
        throw new Error(
          typeof data.error === "string" ? data.error : "Erreur",
        );
      toast({ title: "Vinyle supprimé" });
      setDeleteOpen(false);
      setToDelete(null);
      refetch();
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

  const togglePriceSort = () =>
    setPriceSort((s) => (s === "none" ? "asc" : s === "asc" ? "desc" : "none"));

  return (
    <div className="tekno-container py-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <CardTitle>Distribution — Vinyles</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Rafraîchir
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setManageOpen(true)}
                  >
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
            <VinyleTable
              records={filtered}
              isAdmin={isAdmin}
              priceSort={priceSort}
              onTogglePriceSort={togglePriceSort}
              resolveArtistes={resolveArtistes}
              getQty={getQty}
              onQtyChange={bumpQty}
              onAddToCart={addVinyleToCart}
              onEdit={openEdit}
              onDelete={(r) => {
                setToDelete(r);
                setDeleteOpen(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      <VinyleFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editing={editing}
        form={form}
        setForm={setForm}
        artistes={artistes}
        saving={saving}
        onSave={handleSave}
      />

      <DeleteVinyleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={toDelete}
        saving={saving}
        onConfirm={handleDelete}
      />

      {isAdmin && (
        <ManageDistributorsDialog
          open={manageOpen}
          onOpenChange={setManageOpen}
        />
      )}
    </div>
  );
};

export default DistributionPage;