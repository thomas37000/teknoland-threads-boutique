import { supabase } from "@/integrations/supabase/client";

// Fetch user role from the dedicated user_roles table (more secure)
export const fetchUserRole = async (userId: string) => {
  try {
    // Query the user_roles table for the user's highest priority role
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('role', { ascending: true }) // admin < client < seller alphabetically, but we prioritize admin
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user role from user_roles:", error);
      // Fallback: try to get role from profiles for backward compatibility
      return await fetchUserRoleFromProfiles(userId);
    }
    
    if (data) {
      const roleValue = data.role || 'client';
      const isUserAdmin = roleValue === 'admin';
      return { role: roleValue, isAdmin: isUserAdmin };
    }
    
    // No role found in user_roles, try profiles as fallback
    return await fetchUserRoleFromProfiles(userId);
  } catch (error) {
    console.error("Error fetching user role:", error);
    return { role: null, isAdmin: false };
  }
};

// Fallback function to check profiles table (for backward compatibility during migration)
const fetchUserRoleFromProfiles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching role from profiles:", error);
      return { role: null, isAdmin: false };
    }
    
    if (data) {
      const roleValue = data.roles || 'client';
      const isUserAdmin = roleValue === 'admin';
      return { role: roleValue, isAdmin: isUserAdmin };
    }
  } catch (error) {
    console.error("Error in fallback role fetch:", error);
  }
  
  return { role: null, isAdmin: false };
};
