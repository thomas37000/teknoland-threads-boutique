
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationAlertProps {
  onBackToLogin: () => void;
}

const VerificationAlert = ({ onBackToLogin }: VerificationAlertProps) => {
  return (
    <Alert>
      <AlertDescription className="text-center py-4">
        Vérification email envoyé! Svp regardez dans vos emails et cliquez sur le lien reçu.
        <Button
          className="mt-4 w-full"
          variant="outline"
          onClick={onBackToLogin}
        >
          Retour à la connexion
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default VerificationAlert;
