import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DiscogsRelease {
  id: string;
  release_id: number;
  title: string;
  artist: string | null;
  year: number | null;
  thumbnail: string | null;
  discogs_url: string | null;
  current_collection_count: number;
  current_wantlist_count: number;
  last_synced_at: string | null;
}

export interface DiscogsSyncState {
  last_full_sync_at: string | null;
  last_stats_sync_at: string | null;
  unseen_collection_delta: number;
  unseen_wantlist_delta: number;
  last_admin_viewed_at: string | null;
}

export interface DiscogsDelta {
  release_id: number;
  delta_collection: number;
  delta_wantlist: number;
  recorded_at: string;
}

/**
 * useDiscogs
 * - releases : liste des releases du label avec totaux courants
 * - state    : compteurs de nouveautés non vues (badge sidebar)
 * - deltas   : agrégation des deltas depuis last_admin_viewed_at
 * - actions  : refresh, syncReleases, syncStats, markSeen
 */
export function useDiscogs() {
  const [releases, setReleases] = useState<DiscogsRelease[]>([]);
  const [state, setState] = useState<DiscogsSyncState | null>(null);
  const [deltas, setDeltas] = useState<Record<number, { coll: number; want: number }>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: rel }, { data: st }] = await Promise.all([
      supabase
        .from("discogs_releases")
        .select("*")
        .order("year", { ascending: false, nullsFirst: false })
        .order("title", { ascending: true }),
      supabase.from("discogs_sync_state").select("*").eq("singleton", true).maybeSingle(),
    ]);

    setReleases((rel as any) ?? []);
    setState((st as any) ?? null);

    // Agrège les deltas (>0) depuis la dernière visite admin
    const since = (st as any)?.last_admin_viewed_at ?? "1970-01-01";
    const { data: hist } = await supabase
      .from("discogs_stats_history")
      .select("release_id, delta_collection, delta_wantlist, recorded_at")
      .gt("recorded_at", since);

    const map: Record<number, { coll: number; want: number }> = {};
    for (const h of (hist as DiscogsDelta[]) ?? []) {
      const k = h.release_id;
      if (!map[k]) map[k] = { coll: 0, want: 0 };
      if (h.delta_collection > 0) map[k].coll += h.delta_collection;
      if (h.delta_wantlist > 0) map[k].want += h.delta_wantlist;
    }
    setDeltas(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const syncReleases = async () => {
    setSyncing(true);
    const { error } = await supabase.functions.invoke("discogs-sync-releases");
    setSyncing(false);
    if (!error) await fetchAll();
    return { error };
  };

  const syncStats = async () => {
    setSyncing(true);
    const { error } = await supabase.functions.invoke("discogs-sync-stats");
    setSyncing(false);
    if (!error) await fetchAll();
    return { error };
  };

  const markSeen = async () => {
    await supabase.functions.invoke("discogs-mark-seen");
    await fetchAll();
  };

  return { releases, state, deltas, loading, syncing, fetchAll, syncReleases, syncStats, markSeen };
}

/** Lightweight hook just for the sidebar badge total. */
export function useDiscogsUnseen() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      // Récupère la date de la dernière visite admin
      const { data: st } = await supabase
        .from("discogs_sync_state")
        .select("last_admin_viewed_at")
        .eq("singleton", true)
        .maybeSingle();
      const since = st?.last_admin_viewed_at ?? "1970-01-01";
      // Compte le nombre de releases distinctes avec un delta positif depuis cette date
      const { data: hist } = await supabase
        .from("discogs_stats_history")
        .select("release_id, delta_collection, delta_wantlist")
        .gt("recorded_at", since);
      const distinct = new Set<number>();
      for (const h of (hist as any[]) ?? []) {
        if ((h.delta_collection ?? 0) > 0 || (h.delta_wantlist ?? 0) > 0) {
          distinct.add(h.release_id);
        }
      }
      if (active) setCount(distinct.size);
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);
  return count;
}