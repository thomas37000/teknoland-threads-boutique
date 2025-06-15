import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  hasExceededInactivityTimeout, 
  clearActivity 
} from "@/utils/auth-activity";

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out. Please try again.");
    } else {
      clearActivity();
    }
  } catch (error) {
    toast.error("An unexpected error occurred.");
  }
};

export const verifyOtp = async (email: string, token: string) => {
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

export const autoLogout = async () => {
  toast.info("Vous avez été déconnecté automatiquement après 72h d'inactivité");
  await signOut();
};

export const checkInactivityTimeout = (session: any) => {
  if (session && hasExceededInactivityTimeout()) {
    setTimeout(() => {
      autoLogout();
    }, 0);
  }
};
