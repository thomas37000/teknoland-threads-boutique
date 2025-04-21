
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

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

  // For forgot password workflow
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);

  // Check if user is redirected from email verification
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (error) {
      toast.error(errorDescription || "Verification failed");
    }
  }, []);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Handle login with email and password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup with email and password
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
        throw error;
      }

      setVerificationSent(true);
      toast.success("Registration successful! Please check your email for verification.");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password workflow
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

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-tekno-black mb-2">Teknoland</h1>
          <p className="text-gray-500">Connectez vous ou créez un nouveau compte</p>
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPw} onOpenChange={setShowForgotPw}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
              <DialogDescription>
                Entrez votre adresse email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <Label htmlFor="forgotEmail">Email</Label>
              <Input
                id="forgotEmail"
                type="email"
                placeholder="Votre email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoFocus
              />
              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full" disabled={forgotSending}>
                  {forgotSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" /> Envoi...
                    </span>
                  ) : (
                    <>
                      <mail className="mr-2" /> Envoyer le lien
                    </>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    Annuler
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {verificationSent ? (
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
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Tapez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
              {/* Mot de passe oublié */}
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
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Créer un mot de passe à 6 caractères minimum"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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

