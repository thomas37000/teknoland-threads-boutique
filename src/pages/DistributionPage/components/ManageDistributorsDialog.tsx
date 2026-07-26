import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import type { ProfileRow } from "../types";

/**
 * Dialogue admin permettant d'accorder ou retirer le rôle `distributor` à un
 * utilisateur. Les rôles sont stockés dans la table `user_roles` (RBAC).
 */
export const ManageDistributorsDialog = ({
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
      const [{ data: profs, error: e1 }, { data: roles, error: e2 }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, email, full_name")
            .order("email", { ascending: true }),
          supabase
            .from("user_roles")
            .select("user_id, role")
            .eq("role", "distributor" as any),
        ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setProfiles((profs as ProfileRow[]) || []);
      setDistributorIds(
        new Set(((roles as any[]) || []).map((r) => r.user_id)),
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return (
      (p.email || "").toLowerCase().includes(q) ||
      (p.full_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gérer les distributeurs</DialogTitle>
          <DialogDescription>
            Accorde ou retire l'accès à la page Distribution pour chaque
            utilisateur.
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
            <div className="p-6 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aucun utilisateur
            </div>
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
                      <TableCell className="text-sm">
                        {p.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.full_name || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={is ? "destructive" : "default"}
                          disabled={busyId === p.id}
                          onClick={() => toggle(p.id, is)}
                        >
                          {busyId === p.id && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
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