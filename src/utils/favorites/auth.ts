
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
    // Set up auth state listener first
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      
      // Clear favorites when user logs out
      if (event === 'SIGNED_OUT') {
        // Loading from localStorage happens in the main hook
      }
      
      // Reloading favorites when user logs in happens in the main hook
    });
    
    setAuthListener(data);
    
    // Then check for existing session
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
          setIsSupabaseConnected(false);
          setUser(null);
        } else {
          setUser(data.session?.user || null);
        }
      } catch (error) {
        console.error("Failed to connect to Supabase:", error);
        setIsSupabaseConnected(false);
        setUser(null);
      }
    };
    
    checkUser();
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, isSupabaseConnected, authListener };
};
