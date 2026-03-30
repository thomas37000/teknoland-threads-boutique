import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBuckets = () => {
  const [buckets, setBuckets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuckets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-buckets", {
        body: { action: "list" },
      });
      if (error) throw error;
      const names = (data?.buckets || []).map((b: any) => b.name).sort();
      setBuckets(names);
    } catch (err) {
      console.error("Error fetching buckets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  return { buckets, loading, refetch: fetchBuckets };
};
