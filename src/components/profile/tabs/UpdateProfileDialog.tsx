
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UpdateProfileDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateProfileDialog: React.FC<UpdateProfileDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  // Remettre à jour les valeurs à chaque ouverture (si props changent)
  React.useEffect(() => {
    setFullName(user?.user_metadata?.full_name || "");
    setEmail(user?.email || "");
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Met à jour Supabase Auth (email)
    let errorAuth;
    if (email && email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) errorAuth = error;
    }
    // Met à jour nom complet (user_metadata)
    let errorMeta;
    if (fullName !== user?.user_metadata?.full_name) {
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
      if (error) errorMeta = error;
    }

    setLoading(false);

    if (!errorAuth && !errorMeta) {
      toast({ title: "Succès", description: "Profil mis à jour." });
      onOpenChange(false);
      // Vous pouvez aussi forcer un rafraîchissement ici si besoin
    } else {
      let errorMsg = errorAuth?.message || errorMeta?.message || "Erreur lors de la mise à jour";
      toast({ title: "Erreur", description: errorMsg });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mettre à jour mes informations</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 py-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className="block text-sm mb-1">Nom complet</label>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              placeholder="Votre nom complet"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Mise à jour..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
