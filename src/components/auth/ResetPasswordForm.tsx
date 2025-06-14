
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { validatePassword } from "@/utils/passwordValidation";

interface ResetPasswordFormProps {
  onCancel: () => void;
}

const ResetPasswordForm = ({ onCancel }: ResetPasswordFormProps) => {
  const navigate = useNavigate();
  const [resetPw, setResetPw] = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");
  const [resetPwLoading, setResetPwLoading] = useState(false);
  const [showResetPasswordIcon, setShowResetPasswordIcon] = useState(false);
  const [resetPasswordErrors, setResetPasswordErrors] = useState<string[]>([]);
  const [showResetPasswordErrors, setShowResetPasswordErrors] = useState(false);

  // Validate reset password as user types
  useEffect(() => {
    if (resetPw) {
      const { errors } = validatePassword(resetPw);
      setResetPasswordErrors(errors);
    } else {
      setResetPasswordErrors([]);
    }
  }, [resetPw]);

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
      window.location.hash = "";
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
            onClick={onCancel}
            type="button"
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
