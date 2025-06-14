
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./types";

export const fetchUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user role:", error);
      return { role: null, isAdmin: false };
    }
    
    if (data) {
      const profile = data as Profile;
      const roleValue = profile.roles || profile.role || 'client';
      
      console.log("User profile data:", profile);
      console.log("Role detected:", roleValue);
      
      const isUserAdmin = 
        roleValue?.toLowerCase() === 'admin' || 
        profile.accountStatus?.toLowerCase() === 'admin';
      
      console.log("Is admin:", isUserAdmin);
      
      return { role: roleValue, isAdmin: isUserAdmin };
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
  
  return { role: null, isAdmin: false };
};
