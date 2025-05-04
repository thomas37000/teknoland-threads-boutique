import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const CookieConsent = () => {
  const [hasAccepted, setHasAccepted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'true') {
      setHasAccepted(true);
    }
  }, []);

  const acceptCookies = async () => {
    // Need to update only the allowed fields for profile updates
    await supabase.from('profiles').update({
      // Only include fields that are part of the profiles table schema
      updated_at: new Date().toISOString()
      // Don't add cookieConsent here as it's not in the schema
    }).eq('id', user?.id);

    // Instead, store cookie consent in localStorage or session
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    setHasAccepted(true);
  };

  if (hasAccepted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-200 p-4 flex items-center justify-between">
      <p className="text-sm text-gray-700">
        We use cookies to improve your experience. By using our site, you agree to our use of cookies.
      </p>
      <Button onClick={acceptCookies} variant="outline" size="sm">
        Accept Cookies
      </Button>
    </div>
  );
};

export default CookieConsent;
