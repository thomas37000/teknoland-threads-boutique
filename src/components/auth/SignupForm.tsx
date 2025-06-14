
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validatePassword } from "@/utils/passwordValidation";

interface SignupFormProps {
  onVerificationSent: () => void;
}

const SignupForm = ({ onVerificationSent }: SignupFormProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [showPasswordIcon, setShowPasswordIcon] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswordErrors, setShowPasswordErrors] = useState(false);

  // Validate password as user types
  useEffect(() => {
    if (password) {
      const { errors } = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password before signup
    const { isValid, errors } = validatePassword(password);
    
    if (!isValid) {
      setShowPasswordErrors(true);
      return;
    }
    
    setIsLoading(true);
    setSignupError("");

    try {
      const redirectTo = `${window.location.origin}/auth`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setSignupError(t('auth.emailExistsError'));
        } else if (error.message.includes("already been registered")) {
          setSignupError(t('auth.emailExistsError'));
        } else {
          setSignupError(error.message || t('auth.signupError'));
        }
        return;
      }

      onVerificationSent();
      toast.success(t('auth.registrationSuccess'));
    } catch (error: any) {
      setSignupError(t('auth.signupError'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordRequirements = (errors: string[]) => {
    if (errors.length === 0) return null;
    
    return (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm font-medium text-yellow-800 mb-1">{t('auth.passwordRequirements')}</p>
        <ul className="text-xs text-yellow-700 list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {signupError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {signupError}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">{t('auth.fullName')}</Label>
        <Input
          id="fullName"
          type="text"
          placeholder={t('auth.fullNamePlaceholder')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupEmail">{t('auth.email')}</Label>
        <Input
          id="signupEmail"
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSignupError("");
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupPassword">{t('auth.password')}</Label>
        <div className="relative">
          <Input
            id="signupPassword"
            type={showPasswordIcon ? "text" : "password"}
            placeholder={t('auth.passwordCreatePlaceholder')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setSignupError("");
            }}
            onFocus={() => setShowPasswordErrors(true)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPasswordIcon(!showPasswordIcon)}
          >
            {showPasswordIcon ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {showPasswordErrors && renderPasswordRequirements(passwordErrors)}
      </div>

      <Button
        type="submit"
        className="w-full bg-tekno-blue hover:bg-tekno-blue/90"
        disabled={isLoading || passwordErrors.length > 0}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.pleaseWait')}
          </>
        ) : (
          t('auth.signupButton')
        )}
      </Button>
    </form>
  );
};

export default SignupForm;
