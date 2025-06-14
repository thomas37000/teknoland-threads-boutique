
import { Session, User } from "@supabase/supabase-js";

export interface UserWithRole extends User {
  role?: string;
}

export interface AuthContextType {
  user: UserWithRole | null;
  session: Session | null;
  isLoading: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  isAdmin: boolean;
}

export interface Profile {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  role?: string | null;  
  roles?: string | null;
  accountStatus?: string | null;
  cookieConsent?: boolean | null;
  cookieConsentDate?: string | null;
}
