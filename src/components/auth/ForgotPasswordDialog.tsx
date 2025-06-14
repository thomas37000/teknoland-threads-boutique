
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const { t } = useTranslation();
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSending(true);
    try {
      if (!forgotEmail) {
        toast.error(t('auth.enterEmail'));
        return;
      }
      const redirectTo = `${window.location.origin}/auth`;

      const { data, error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo,
      });
      if (error) throw error;
      toast.success(t('auth.resetEmailSent'));
      onOpenChange(false);
      setForgotEmail("");
    } catch (error: any) {
      toast.error(error.message || t('auth.cannotSendEmail'));
    }
    setForgotSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auth.resetPasswordTitle')}</DialogTitle>
          <DialogDescription>
            {t('auth.resetPasswordDesc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgotEmail">{t('auth.email')}</Label>
            <Input
              id="forgotEmail"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
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
                  <Loader2 className="animate-spin" /> {t('auth.sending')}
                </span>
              ) : (
                t('auth.sendResetLink')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
