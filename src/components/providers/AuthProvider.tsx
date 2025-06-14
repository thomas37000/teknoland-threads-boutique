
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { 
  updateLastActivity, 
  setupActivityTracking 
} from "@/utils/auth-activity";
import { UserWithRole } from "@/utils/auth/types";
import { handleAuthUrlParams } from "@/utils/auth/url-handler";
import { fetchUserRole } from "@/utils/auth/role-manager";
import { signOut, verifyOtp, checkInactivityTimeout } from "@/utils/auth/session-manager";
import { AuthContext } from "@/contexts/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const updateUserRole = async (userId: string) => {
    const { role, isAdmin: adminStatus } = await fetchUserRole(userId);
    setUserRole(role);
    setIsAdmin(adminStatus);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { shouldContinue } = await handleAuthUrlParams();
      if (!shouldContinue) {
        setIsLoading(false);
        return;
      }

      // Set up auth state listener first
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          console.log("Auth state changed:", event);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
          
          // Handle auth events
          if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setUserRole(null);
            setIsAdmin(false);
            toast.info("You have been signed out");
          } else if (event === 'SIGNED_IN' && !isInitialLoad) {
            // Only show toast for actual sign-in events, not session restoration
            console.log('User signed in', currentSession);
            if (currentSession?.user) {
              updateLastActivity();
              updateUserRole(currentSession.user.id);
            }
            toast.success("Successfully signed in!");
          } else if (event === 'SIGNED_IN' && isInitialLoad) {
            // This is session restoration, don't show toast
            console.log('Session restored', currentSession);
            if (currentSession?.user) {
              updateLastActivity();
              updateUserRole(currentSession.user.id);
            }
          } else if (event === 'USER_UPDATED') {
            console.log('User updated');
            if (currentSession?.user) {
              updateUserRole(currentSession.user.id);
            }
          } else if (event === 'PASSWORD_RECOVERY') {
            console.log('Password recovery event');
          }
        }
      );

      // Then check for existing session
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        }
        
        console.log("Current session:", currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession) {
          checkInactivityTimeout(currentSession);
          updateUserRole(currentSession.user.id);
        }
        
        setIsLoading(false);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error in session initialization:", error);
        setIsLoading(false);
        setIsInitialLoad(false);
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  // Setup activity tracking and periodic inactivity checks
  useEffect(() => {
    if (!session) return;

    const cleanupActivityTracking = setupActivityTracking();

    const inactivityCheckInterval = setInterval(() => {
      checkInactivityTimeout(session);
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      cleanupActivityTracking();
      clearInterval(inactivityCheckInterval);
    };
  }, [session]);

  const value = {
    user,
    session,
    isLoading,
    userRole,
    signOut,
    verifyOtp,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
