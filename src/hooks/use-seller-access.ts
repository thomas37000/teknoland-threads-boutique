import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useSellerAccess() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) {
        if (!cancelled) {
          setIsSeller(false);
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
        console.error("useSellerAccess error:", error);
        setIsSeller(false);
      } else {
        setIsSeller((data || []).some((r: any) => r.role === "seller"));
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
    isSeller,
    isAdmin,
    hasAccess: isAdmin || isSeller,
  };
}
