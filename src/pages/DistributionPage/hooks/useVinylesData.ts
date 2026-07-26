import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Artiste, VinyleRecord } from "../types";

/**
 * Charge en parallèle les tables Airtable « Vinyles » et « Artistes » via
 * l'edge function `airtable-proxy`. Expose l'état et une fonction de refetch.
 */
export function useVinylesData() {
  const { toast } = useToast();
  const [records, setRecords] = useState<VinyleRecord[]>([]);
  const [artistes, setArtistes] = useState<Artiste[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const [vinylesRes, artistesRes] = await Promise.all([
        supabase.functions.invoke("airtable-proxy", {
          body: { method: "GET", table: "Vinyles" },
        }),
        supabase.functions.invoke("airtable-proxy", {
          body: { method: "GET", table: "Artistes" },
        }),
      ]);
      if (vinylesRes.error) throw vinylesRes.error;
      if (vinylesRes.data?.error) {
        throw new Error(
          typeof vinylesRes.data.error === "string"
            ? vinylesRes.data.error
            : "Erreur Airtable",
        );
      }
      setRecords(vinylesRes.data?.records || []);
      if (!artistesRes.error && !artistesRes.data?.error) {
        setArtistes((artistesRes.data?.records as Artiste[]) || []);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { records, artistes, loading, refetch: fetchRecords };
}