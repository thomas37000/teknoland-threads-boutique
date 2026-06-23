import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, Plus } from "lucide-react";
import { AddEditArtisteDialog } from "./ArtistesDialogs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useToast } from "@/hooks/use-toast";

interface ScArtist {
  id: string;
  fields: {
    Name?: string;
    Soundcloud_url?: string;
    "Followers Count"?: number;
    "Followers Delta"?: number;
    "Last Sync"?: string;
    "SoundCloud User ID"?: string;
    Followers?: number;
  };
}

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

const DeltaBadge: React.FC<{ value: number }> = ({ value }) => {
  if (!value) return <Badge variant="secondary">0</Badge>;
  const sign = value > 0 ? "+" : "";
  const variant = value > 0 ? "default" : "destructive";
  return (
    <Badge variant={variant} className={value > 0 ? "bg-green-600 hover:bg-green-700" : ""}>
      {sign}
      {value}
    </Badge>
  );
};

const SoundCloudManagement: React.FC = () => {
  const [artists, setArtists] = useState<ScArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [syncSummary, setSyncSummary] = useState<{ updated: number; skipped: number; total: number } | null>(null);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();


  const fetchArtists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("airtable-proxy", {
        body: { method: "GET", table: "Artistes" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setArtists(data.records ?? []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les artistes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncErrors([]);
      setSyncSummary(null);
      toast({
        title: "Synchronisation en cours",
        description: "Récupération des followers SoundCloud…",
      });
      const { data, error } = await supabase.functions.invoke("soundcloud-sync", {
        body: {},
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSyncSummary({
        updated: data.updated ?? 0,
        skipped: data.skipped ?? 0,
        total: data.total ?? 0,
      });

      if (Array.isArray(data.errors) && data.errors.length > 0) {
        setSyncErrors(data.errors);
        toast({
          title: "Synchronisation terminée avec erreurs",
          description: `${data.updated} mis à jour, ${data.skipped} ignorés, ${data.errors.length} erreur(s)`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: `${data.updated} mis à jour, ${data.skipped} ignorés`,
        });
      }
      fetchArtists();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Sync impossible";
      setSyncErrors([message]);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };


  useEffect(() => {
    fetchArtists();
  }, []);

  const filtered = artists
    .filter((a) => !!a.fields?.Soundcloud_url)
    .filter((a) =>
      (a.fields.Name ?? "").toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (b.fields["Followers Delta"] ?? 0) - (a.fields["Followers Delta"] ?? 0));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>SoundCloud</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un artiste
            </Button>
            <Button onClick={handleSync} disabled={syncing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              Sync maintenant
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {syncErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>La synchronisation a échoué pour certains artistes</AlertTitle>
            <AlertDescription>
              {syncSummary && (
                <div className="mb-2 text-sm">
                  {syncSummary.updated} mis à jour · {syncSummary.skipped} ignorés · {syncSummary.total} au total
                </div>
              )}
              <ul className="list-disc pl-4 space-y-1 text-sm max-h-48 overflow-y-auto">
                {syncErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div className="mb-4 max-w-sm">

          <Input
            placeholder="Rechercher un artiste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <TableSkeleton rows={8} columns={4} />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artiste</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Delta</TableHead>
                  <TableHead>Dernière sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.fields.Name}</TableCell>
                    <TableCell>
                      {(a.fields["Followers Count"] ?? a.fields.Followers ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DeltaBadge value={a.fields["Followers Delta"] ?? 0} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(a.fields["Last Sync"])}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucun artiste avec une URL SoundCloud.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <AddEditArtisteDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={fetchArtists}
      />
    </Card>
  );
};

export default SoundCloudManagement;