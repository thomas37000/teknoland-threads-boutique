
import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface CookieConsentProps {
  onConsentChange?: (hasConsented: boolean) => void;
}

const CookieConsent = ({ onConsentChange }: CookieConsentProps) => {
  const [open, setOpen] = useState(false);
  const [hasSeenConsent, setHasSeenConsent] = useState(false);
  const { user } = useAuth();

  // Check if user has already seen the consent dialog
  useEffect(() => {
    const checkConsent = () => {
      const consentSaved = localStorage.getItem("cookieConsent");
      if (!consentSaved) {
        setOpen(true);
      } else {
        setHasSeenConsent(true);
      }
    };

    // Small delay to avoid immediate popup on page load
    const timer = setTimeout(checkConsent, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleConsent = async (consented: boolean) => {
    // Save to localStorage regardless of user authentication status
    localStorage.setItem("cookieConsent", JSON.stringify({ 
      consented, 
      timestamp: new Date().toISOString() 
    }));
    
    // Update user profile in Supabase if user is authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            cookieConsent: consented,
            cookieConsentDate: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (error) throw error;
        
        toast.success(consented 
          ? "Vos préférences de cookies ont été enregistrées" 
          : "Vos préférences ont été enregistrées. Nous ne collecterons que les cookies essentiels");
      } catch (error) {
        console.error("Error updating cookie consent:", error);
        toast.error("Une erreur est survenue lors de l'enregistrement de vos préférences");
      }
    }

    // Call the callback if provided
    if (onConsentChange) {
      onConsentChange(consented);
    }

    setHasSeenConsent(true);
    setOpen(false);
  };

  return (
    <>
      {!hasSeenConsent && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Consentement de Cookies
              </DialogTitle>
              <DialogDescription>
                Politique de Confidentialité et de Protection des Données Personnelles
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[50vh] overflow-y-auto pr-2 text-sm">
              <p className="mb-2 font-semibold">INFORMATION SUR L'UTILISATION DES COOKIES</p>
              <p className="mb-2">
                Conformément au règlement général sur la protection des données (RGPD) et à la loi informatique et libertés,
                nous vous informons que notre site utilise des cookies pour améliorer votre expérience utilisateur, 
                personnaliser notre contenu et analyser notre trafic.
              </p>

              <p className="mb-2 font-semibold">QUELS TYPES DE COOKIES UTILISONS-NOUS ?</p>
              <ul className="list-disc pl-5 mb-2">
                <li>
                  <span className="font-medium">Cookies essentiels :</span> Ces cookies sont nécessaires au fonctionnement du site.
                </li>
                <li>
                  <span className="font-medium">Cookies analytiques :</span> Ils nous permettent de recueillir des informations sur l'utilisation de notre site.
                </li>
                <li>
                  <span className="font-medium">Cookies de personnalisation :</span> Ils mémorisent vos préférences pour améliorer votre expérience.
                </li>
                <li>
                  <span className="font-medium">Cookies marketing :</span> Ils peuvent être utilisés pour vous montrer des publicités pertinentes.
                </li>
              </ul>

              <p className="mb-2 font-semibold">VOS DROITS</p>
              <p className="mb-2">
                Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité des données vous concernant, 
                ainsi que d'un droit d'opposition et de limitation du traitement. Vous pouvez exercer ces droits en nous 
                contactant à l'adresse : contact@teknoland.com.
              </p>

              <p className="mb-2">
                Pour plus d'informations sur la façon dont nous traitons vos données personnelles, veuillez consulter 
                notre politique de confidentialité complète.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleConsent(false)}
                className="sm:flex-1"
              >
                Continuer sans accepter
              </Button>
              <Button 
                onClick={() => handleConsent(true)}
                className="bg-tekno-blue hover:bg-tekno-blue/90 sm:flex-1"
              >
                Accepter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CookieConsent;
