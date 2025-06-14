
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import VerificationAlert from "@/components/auth/VerificationAlert";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [verificationSent, setVerificationSent] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { user } = useAuth();

  const [showForgotPw, setShowForgotPw] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");
    const type = hashParams.get("type");

    if (error) {
      toast.error(errorDescription || "Verification failed");
    }

    // Si c'est un lien de récupération de mot de passe, on affiche le formulaire SANS connecter l'utilisateur
    if (type === "recovery") {
      setShowResetPw(true);
      return;
    }
  }, []);

  useEffect(() => {
    // Ne rediriger que si l'utilisateur est connecté ET qu'il n'est pas en train de réinitialiser son mot de passe
    if (user && !showResetPw) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location, showResetPw]);

  const handleCancelReset = () => {
    setShowResetPw(false);
    window.location.hash = "";
  };

  return (
    <AuthLayout>
      {showResetPw ? (
        <ResetPasswordForm onCancel={handleCancelReset} />
      ) : verificationSent ? (
        <VerificationAlert onBackToLogin={() => setVerificationSent(false)} />
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm onShowForgotPassword={() => setShowForgotPw(true)} />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm onVerificationSent={() => setVerificationSent(true)} />
            </TabsContent>
          </Tabs>

          <ForgotPasswordDialog 
            open={showForgotPw} 
            onOpenChange={setShowForgotPw} 
          />
        </>
      )}
    </AuthLayout>
  );
};

export default AuthPage;
