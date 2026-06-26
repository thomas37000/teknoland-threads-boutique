import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useDistributorAccess() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [isDistributor, setIsDistributor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) {
        if (!cancelled) {
          setIsDistributor(false);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (error) {
        console.error("useDistributorAccess error:", error);
        setIsDistributor(false);
      } else {
        setIsDistributor((data || []).some((r: any) => r.role === "distributor"));
      }
      setLoading(false);
    };
    if (!authLoading) run();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return {
    loading: authLoading || loading,
    isDistributor,
    isAdmin,
    hasAccess: isAdmin || isDistributor,
  };
}