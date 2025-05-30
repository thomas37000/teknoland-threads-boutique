
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UserWithRole extends User {
  role?: string;
}

interface AuthContextType {
  user: UserWithRole | null;
  session: Session | null;
  isLoading: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  isAdmin: boolean;
}

// Define the profile data structure based on our database
interface Profile {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  role?: string | null;  
  roles?: string | null;  // Use either role or roles
  accountStatus?: string | null;
  cookieConsent?: boolean | null;
  cookieConsentDate?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user role from profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return;
      }
      
      if (data) {
        // Type assertion to work with the data
        const profile = data as Profile;
        
        // Check for 'roles' or 'role' property
        const roleValue = profile.roles || profile.role || 'client';
        
        console.log("User profile data:", profile);
        console.log("Role detected:", roleValue);
        
        setUserRole(roleValue);
        // Set admin status - checking both lowercase and uppercase versions
        const isUserAdmin = 
          roleValue?.toLowerCase() === 'admin' || 
          profile.accountStatus?.toLowerCase() === 'admin';
        
        setIsAdmin(isUserAdmin);
        console.log("Is admin:", isUserAdmin);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    // Handle URL fragment for email verification et password recovery
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    
    // Pour la récupération de mot de passe, ne pas établir automatiquement la session
    if (type === "recovery" && accessToken) {
      // Ne pas établir de session automatiquement pour les liens de récupération
      console.log("Password recovery link detected, not auto-signing in");
      setIsLoading(false);
      return;
    }
    
    if (type === "email" && accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      }).then(({ data, error }) => {
        if (error) {
          console.error("Error setting session:", error);
          toast.error("Verification failed. Please try again.");
        } else if (data.session) {
          toast.success("Email verified successfully!");
        }
      });
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
        } else if (event === 'SIGNED_IN') {
          console.log('User signed in', currentSession);
          // Fetch user role after sign in
          if (currentSession?.user) {
            setTimeout(() => {
              fetchUserRole(currentSession.user.id);
            }, 0);
          }
          toast.success("Successfully signed in!");
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery event');
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      }
      
      console.log("Current session:", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch user role if session exists
      if (currentSession?.user) {
        fetchUserRole(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("Exception during signout:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Email verified successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to verify email");
      throw error;
    }
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
