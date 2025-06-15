import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import GoogleSignInButton from "./GoogleSignInButton";

interface LoginFormProps {
  onShowForgotPassword: () => void;
}

const LoginForm = ({ onShowForgotPassword }: LoginFormProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fonction pour vérifier si l'email existe dans la base de données auth
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'test_invalid_password_123456789'
      });
      
      if (error) {
        return error.message === "Invalid login credentials" || error.message.includes("Invalid");
      }
      
      return false;
    } catch {
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const emailExists = await checkEmailExists(email);

        if (!emailExists) {
          setLoginError(t('auth.noAccountError'));
        } else if (error.message === "Invalid login credentials" || error.message.includes("Invalid")) {
          setLoginError(t('auth.wrongPasswordError'));
        } else if (error.message.includes("Email not confirmed")) {
          setLoginError(t('auth.confirmEmailError'));
        } else {
          setLoginError(t('auth.loginError'));
        }
        return;
      }

      toast.success("Connexion réussie !");
    } catch (error: any) {
      setLoginError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <GoogleSignInButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            {t('auth.or')}
          </span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {loginError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {loginError}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLoginError("");
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError("");
              }}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-tekno-blue hover:bg-tekno-blue/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.pleaseWait')}
            </>
          ) : (
            t('auth.loginButton')
          )}
        </Button>

        <div className="flex justify-end mt-2">
          <button
            className="text-sm text-tekno-blue hover:underline"
            type="button"
            onClick={onShowForgotPassword}
            tabIndex={0}
          >
            {t('auth.forgotPassword')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
