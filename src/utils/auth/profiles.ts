
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error: any) {
    toast.error(`Failed to get profile: ${error.message}`);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string, 
  profile: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success("Profile updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to update profile: ${error.message}`);
    return null;
  }
};
