
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleAuthUrlParams = async () => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const type = hashParams.get("type");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  
  // Pour la récupération de mot de passe, ne pas établir automatiquement la session
  if (type === "recovery" && accessToken) {
    console.log("Password recovery link detected, not auto-signing in");
    return { shouldContinue: false };
  }
  
  if (type === "email" && accessToken) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });
      
      if (error) {
        console.error("Error setting session:", error);
        toast.error("Verification failed. Please try again.");
      } else if (data.session) {
        toast.success("Email verified successfully!");
      }
    } catch (error) {
      console.error("Error in handleAuthUrlParams:", error);
    }
  }
  
  return { shouldContinue: true };
};
