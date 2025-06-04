import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { validatePassword } from "@/utils/passwordValidation";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { user } = useAuth();

  // Login error state
  const [loginError, setLoginError] = useState("");
  // Signup error state
  const [signupError, setSignupError] = useState("");

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);
  const [showPasswordIcon, setShowPasswordIcon] = useState(false);
  const [showResetPasswordIcon, setShowResetPasswordIcon] = useState(false);

  // Password validation state
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswordErrors, setShowPasswordErrors] = useState(false);

  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);

  const [resetPw, setResetPw] = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");
  const [resetPwLoading, setResetPwLoading] = useState(false);
  const [resetPasswordErrors, setResetPasswordErrors] = useState<string[]>([]);
  const [showResetPasswordErrors, setShowResetPasswordErrors] = useState(false);

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
      // Ne pas établir de session automatiquement
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

  // Validate password as user types
  useEffect(() => {
    if (password) {
      const { errors } = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  // Validate reset password as user types
  useEffect(() => {
    if (resetPw) {
      const { errors } = validatePassword(resetPw);
      setResetPasswordErrors(errors);
    } else {
      setResetPasswordErrors([]);
    }
  }, [resetPw]);

  // Fonction pour vérifier si l'email existe dans la base de données auth
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Essayer de se connecter avec un mot de passe invalide pour tester l'existence de l'email
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'test_invalid_password_123456789'
      });
      
      // Si l'erreur contient "Invalid login credentials", l'email existe
      // Si l'erreur contient autre chose ou pas d'erreur, traiter différemment
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
    setLoginError(""); // Clear any previous errors

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Vérifier si l'email existe d'abord
        const emailExists = await checkEmailExists(email);

        if (!emailExists) {
          setLoginError("Désolé nous n'avons pas de compte enregistré avec cet email");
        } else if (error.message === "Invalid login credentials" || error.message.includes("Invalid")) {
          setLoginError("Mot de passe incorrect. Veuillez réessayer.");
        } else if (error.message.includes("Email not confirmed")) {
          setLoginError("Veuillez confirmer votre email avant de vous connecter");
        } else {
          setLoginError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
        }
        return;
      }

      toast.success("Connexion réussie !");
      navigate("/");
    } catch (error: any) {
      setLoginError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password before signup
    const { isValid, errors } = validatePassword(password);
    
    if (!isValid) {
      setShowPasswordErrors(true);
      return;
    }
    
    setIsLoading(true);
    setSignupError(""); // Clear any previous errors

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
        // Handle specific error cases
        if (error.message.includes("User already registered")) {
          setSignupError("Désolé mais nous avons déjà un compte créé avec cette adresse email");
        } else if (error.message.includes("already been registered")) {
          setSignupError("Désolé mais nous avons déjà un compte créé avec cette adresse email");
        } else {
          setSignupError(error.message || "Erreur lors de la création du compte");
        }
        return;
      }

      setVerificationSent(true);
      toast.success("Registration successful! Please check your email for verification.");
    } catch (error: any) {
      setSignupError("Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSending(true);
    try {
      if (!forgotEmail) {
        toast.error("Veuillez entrer votre email.");
        return;
      }
      const redirectTo = `${window.location.origin}/auth`;

      const { data, error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo,
      });
      if (error) throw error;
      toast.success("Un email de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.");
      setShowForgotPw(false);
      setForgotEmail("");
    } catch (error: any) {
      toast.error(error.message || "Impossible d'envoyer l'e-mail.");
    }
    setForgotSending(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate reset password
    const { isValid, errors } = validatePassword(resetPw);
    
    if (!isValid) {
      setShowResetPasswordErrors(true);
      return;
    }
    
    if (!resetPw || !resetPwConfirm) {
      toast.error("Veuillez entrer et confirmer votre nouveau mot de passe.");
      return;
    }
    
    if (resetPw !== resetPwConfirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    
    setResetPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: resetPw });
      if (error) throw error;
      toast.success("Votre mot de passe a été réinitialisé avec succès !");
      setShowResetPw(false);
      window.location.hash = "";
      // Rediriger vers la page profile après réinitialisation réussie
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message || "Échec de la réinitialisation du mot de passe.");
    }
    setResetPwLoading(false);
  };

  const renderPasswordRequirements = (errors: string[]) => {
    if (errors.length === 0) return null;
    
    return (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm font-medium text-yellow-800 mb-1">Votre mot de passe doit contenir :</p>
        <ul className="text-xs text-yellow-700 list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-tekno-black mb-2">Teknoland</h1>
          <p className="text-gray-500">Connectez vous ou créez un nouveau compte</p>
        </div>

        {showResetPw ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-tekno-black mb-2">Réinitialiser le mot de passe</h2>
              <p className="text-gray-500">Choisissez un nouveau mot de passe pour votre compte.</p>
            </div>
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showResetPasswordIcon ? "text" : "password"}
                    placeholder="Nouveau mot de passe"
                    value={resetPw}
                    onChange={(e) => setResetPw(e.target.value)}
                    onFocus={() => setShowResetPasswordErrors(true)}
                    required
                    autoFocus
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowResetPasswordIcon(!showResetPasswordIcon)}
                  >
                    {showResetPasswordIcon ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {showResetPasswordErrors && renderPasswordRequirements(resetPasswordErrors)}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmez le nouveau mot de passe"
                  value={resetPwConfirm}
                  onChange={(e) => setResetPwConfirm(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <Button type="submit" className="w-full bg-tekno-blue hover:bg-tekno-blue/90" disabled={resetPwLoading}>
                  {resetPwLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" /> Réinitialisation...
                    </span>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowResetPw(false);
                    window.location.hash = "";
                  }}
                  type="button"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        ) : verificationSent ? (
          <Alert>
            <AlertDescription className="text-center py-4">
              Vérification email envoyé! Svp regardez dans vos emails et cliquez sur le lien reçu.
              <Button
                className="mt-4 w-full"
                variant="outline"
                onClick={() => setVerificationSent(false)}
              >
                Retour à la connexion
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Tapez votre email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError(""); // Clear error when user starts typing
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(""); // Clear error when user starts typing
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Veuillez patienter
                    </>
                  ) : (
                    "Connexion"
                  )}
                </Button>
              </form>
              <div className="flex justify-end mt-2">
                <button
                  className="text-sm text-tekno-blue hover:underline"
                  type="button"
                  onClick={() => setShowForgotPw(true)}
                  tabIndex={0}
                >
                  Mot de passe oublié&nbsp;?
                </button>
              </div>
              
              <Dialog open={showForgotPw} onOpenChange={setShowForgotPw}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Réinitialiser votre mot de passe</DialogTitle>
                    <DialogDescription>
                      Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgotEmail">Email</Label>
                      <Input
                        id="forgotEmail"
                        type="email"
                        placeholder="Entrez votre email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={forgotSending} className="w-full">
                        {forgotSending ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" /> Envoi en cours...
                          </span>
                        ) : (
                          "Envoyer le lien de réinitialisation"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {signupError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {signupError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom entier</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="prénom nom"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSignupError(""); // Clear error when user starts typing
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPasswordIcon ? "text" : "password"}
                      placeholder="Créer un mot de passe sécurisé"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setSignupError(""); // Clear error when user starts typing
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Veuillez patienter
                    </>
                  ) : (
                    "Créer un compte"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
