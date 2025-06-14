
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationAlertProps {
  onBackToLogin: () => void;
}

const VerificationAlert = ({ onBackToLogin }: VerificationAlertProps) => {
  const { t } = useTranslation();

  return (
    <Alert>
      <AlertDescription className="text-center py-4">
        {t('auth.verificationSent')}
        <Button
          className="mt-4 w-full"
          variant="outline"
          onClick={onBackToLogin}
        >
          {t('auth.backToLogin')}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default VerificationAlert;
