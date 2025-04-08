
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthHookResult {
  user: { id: string } | null;
  isSupabaseConnected: boolean;
  authListener: { subscription: { unsubscribe: () => void } } | null;
}

export const useFavoritesAuth = (): AuthHookResult => {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);
  const [authListener, setAuthListener] = useState<{ subscription: { unsubscribe: () => void } } | null>(null);

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error checking user:", error);
          setIsSupabaseConnected(false);
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to connect to Supabase:", error);
        setIsSupabaseConnected(false);
        setUser(null);
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      
      // Clear favorites when user logs out
      if (event === 'SIGNED_OUT') {
        // Loading from localStorage happens in the main hook
      }
      
      // Reloading favorites when user logs in happens in the main hook
    });
    
    setAuthListener(data);
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, isSupabaseConnected, authListener };
};
