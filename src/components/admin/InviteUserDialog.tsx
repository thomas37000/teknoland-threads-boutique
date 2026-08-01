import { useState } from "react";
import PopupAdmin from "./PopupAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type InviteRole = "client" | "seller" | "distributor" | "admin";

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited: () => void;
}

const InviteUserDialog = ({ isOpen, onClose, onInvited }: InviteUserDialogProps) => {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [role, setRole] = useState<InviteRole>("client");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setFirstname("");
    setLastname("");
    setRole("client");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("L'email est requis");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email: email.trim(), firstname: firstname.trim(), lastname: lastname.trim(), role },
      });

      if (error) {
        // supabase-js met le corps de la réponse d'erreur dans error.context
        let message = "Erreur lors de l'invitation";
        try {
          const ctx = (error as any).context;
          if (ctx) {
            const errBody = await ctx.json();
            if (errBody?.error) message = errBody.error;
          }
        } catch { /* ignore */ }
        toast.error(message);
        return;
      }

      if (data?.warning) {
        toast.warning(data.warning);
      } else {
        toast.success(`Invitation envoyée à ${email.trim()} avec un mot de passe temporaire`);
      }
      onInvited();
      handleClose();
    } catch (e) {
      console.error("Invite error:", e);
      toast.error("Erreur lors de l'invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopupAdmin isOpen={isOpen} onClose={handleClose} title="Inviter un nouvel utilisateur">
      <p className="text-sm text-gray-600 mb-4">
        L'utilisateur recevra un email avec un <strong>mot de passe temporaire</strong> qu'il
        pourra modifier après sa première connexion.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="utilisateur@exemple.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rôle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as InviteRole)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="client">Client</option>
            <option value="seller">Vendeur</option>
            <option value="distributor">Distributeur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-tekno-blue text-white py-2 rounded-md hover:bg-tekno-blue/90 disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...
            </>
          ) : (
            "Envoyer l'invitation"
          )}
        </button>
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
        >
          Annuler
        </button>
      </div>
    </PopupAdmin>
  );
};

export default InviteUserDialog;