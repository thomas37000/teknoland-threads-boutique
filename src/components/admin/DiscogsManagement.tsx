import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Disc3, Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDiscogs } from "@/hooks/useDiscogs";
import { ReleaseCard } from "./discogs/ReleaseCard";
import { useToast } from "@/hooks/use-toast";

/**
 * DiscogsManagement
 *
 * Onglet admin Discogs. Affiche les releases du label 1625918 avec leurs stats
 * collection / wantlist, et met en évidence les nouveaux ajouts depuis la
 * dernière visite admin.
 *
 * - useDiscogs() : releases + state + deltas + actions
 * - À l'ouverture : appelle markSeen() pour reset le badge sidebar
 * - Tri : releases avec deltas en premier, puis par année desc
 */
const DiscogsManagement = () => {
  const { releases, state, deltas, loading, syncing, syncReleases, syncStats, markSeen } =
    useDiscogs();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Marquer comme vu à l'ouverture de l'onglet
  useEffect(() => {
    markSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? releases.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            (r.artist ?? "").toLowerCase().includes(q),
        )
      : releases;
    return [...list].sort((a, b) => {
      const da = (deltas[a.release_id]?.coll ?? 0) + (deltas[a.release_id]?.want ?? 0);
      const db = (deltas[b.release_id]?.coll ?? 0) + (deltas[b.release_id]?.want ?? 0);
      if (db !== da) return db - da;
      return (b.year ?? 0) - (a.year ?? 0);
    });
  }, [releases, deltas, search]);

  const totalDeltaColl = Object.values(deltas).reduce((s, d) => s + d.coll, 0);
  const totalDeltaWant = Object.values(deltas).reduce((s, d) => s + d.want, 0);

  const handleSyncReleases = async () => {
    setError(null);
    const { error } = await syncReleases();
    if (error) {
      setError(error.message ?? "Erreur lors de la synchronisation");
      toast({ title: "Erreur sync", description: String(error.message), variant: "destructive" });
    } else {
      toast({ title: "Releases synchronisées" });
    }
  };

  const handleSyncStats = async () => {
    setError(null);
    const { error } = await syncStats();
    if (error) {
      setError(error.message ?? "Erreur lors de la synchronisation");
      toast({ title: "Erreur sync", description: String(error.message), variant: "destructive" });
    } else {
      toast({ title: "Stats synchronisées (batch)" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Disc3 className="h-6 w-6" /> Discogs
          </h2>
          <p className="text-sm text-muted-foreground">
            Label 1625918 · {releases.length} releases ·{" "}
            {state?.last_stats_sync_at
              ? `Dernier sync stats : ${new Date(state.last_stats_sync_at).toLocaleString("fr-FR")}`
              : "Aucun sync stats"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncReleases} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            Importer releases
          </Button>
          <Button onClick={handleSyncStats} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            Sync stats (batch)
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total releases</p>
            <p className="text-2xl font-bold">{releases.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total collection</p>
            <p className="text-2xl font-bold">
              {releases.reduce((s, r) => s + r.current_collection_count, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Disc3 className="h-3 w-3" /> Nouveaux en collection
            </p>
            <p className="text-2xl font-bold text-emerald-600">+{totalDeltaColl}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3" /> Nouveaux en wantlist
            </p>
            <p className="text-2xl font-bold text-rose-600">+{totalDeltaWant}</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher titre ou artiste..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Disc3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Aucune release. Cliquez sur « Importer releases ».</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((r) => (
            <ReleaseCard
              key={r.id}
              release={r}
              deltaCollection={deltas[r.release_id]?.coll ?? 0}
              deltaWantlist={deltas[r.release_id]?.want ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscogsManagement;