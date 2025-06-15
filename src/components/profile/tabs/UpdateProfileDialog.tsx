
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UpdateProfileDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const civiliteOptions = [
  { value: "M", label: "M" },
  { value: "Mme", label: "Mme" },
];

function validePrenom(value: string) {
  // Seules les lettres, le point et l'espace autorisés
  return /^[A-Za-zÀ-ÿ.\s]+$/.test(value);
}

const UpdateProfileDialog: React.FC<UpdateProfileDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  // Préremplissage depuis user_metadata si dispo
  const [civilite, setCivilite] = useState(
    user?.user_metadata?.civilite || "M"
  );
  const [prenom, setPrenom] = useState(
    user?.user_metadata?.prenom || ""
  );
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [nom, setNom] = useState(
    user?.user_metadata?.nom || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [motDePasse, setMotDePasse] = useState("");
  const [nvMotDePasse, setNvMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [prenomError, setPrenomError] = useState<string | null>(null);

  // Actualise champs si props changent/dialogue s'ouvre/ferme
  React.useEffect(() => {
    setCivilite(user?.user_metadata?.civilite || "M");
    setPrenom(user?.user_metadata?.prenom || "");
    setFullName(user?.user_metadata?.full_name || "");
    setNom(user?.user_metadata?.nom || "");
    setEmail(user?.email || "");
    setMotDePasse("");
    setNvMotDePasse("");
    setPrenomError(null);
  }, [user, open]);

  const handlePrenomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrenom(value);
    if (!validePrenom(value)) {
      setPrenomError(
        "Seules les lettres et le point (.), suivi d'un espace, sont autorisés."
      );
    } else {
      setPrenomError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation Prénom
    if (!validePrenom(prenom)) {
      setPrenomError(
        "Seules les lettres et le point (.), suivi d'un espace, sont autorisés."
      );
      return;
    }
    // Validation mot de passe (au moins 5 caractères)
    if (nvMotDePasse && nvMotDePasse.length < 5) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 5 caractères.",
      });
      return;
    }
    if (!motDePasse || motDePasse.length < 5) {
      toast({
        title: "Erreur",
        description: "Le mot de passe actuel doit contenir au moins 5 caractères.",
      });
      return;
    }

    setLoading(true);

    // Vérifier le mot de passe actuel (reconnexion)
    const { data: login, error: errorLogin } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    if (errorLogin) {
      setLoading(false);
      toast({
        title: "Erreur d’authentification",
        description: "Mot de passe actuel incorrect.",
      });
      return;
    }

    // Mise à jour du profil (user_metadata + Auth)
    let errorAuth, errorMeta, errorNewPass;
    // Mise à jour email
    if (email && email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) errorAuth = error;
    }
    // Mise à jour user_metadata
    const userMetadataUpdate: any = {};
    if (fullName !== user?.user_metadata?.full_name) userMetadataUpdate.full_name = fullName;
    if (prenom !== user?.user_metadata?.prenom) userMetadataUpdate.prenom = prenom;
    if (civilite !== user?.user_metadata?.civilite) userMetadataUpdate.civilite = civilite;
    if (nom !== user?.user_metadata?.nom) userMetadataUpdate.nom = nom;
    if (Object.keys(userMetadataUpdate).length > 0) {
      const { error } = await supabase.auth.updateUser({ data: userMetadataUpdate });
      if (error) errorMeta = error;
    }
    // Mise à jour du mot de passe si champ rempli et valide
    if (nvMotDePasse && nvMotDePasse.length >= 5) {
      const { error } = await supabase.auth.updateUser({ password: nvMotDePasse });
      if (error) errorNewPass = error;
    }

    setLoading(false);

    if (!errorAuth && !errorMeta && !errorNewPass) {
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès.",
      });
      onOpenChange(false);
    } else {
      let errorMsg =
        errorAuth?.message ||
        errorMeta?.message ||
        errorNewPass?.message ||
        "Erreur lors de la mise à jour";
      toast({
        title: "Erreur",
        description: errorMsg,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mettre à jour mes informations</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 py-2" onSubmit={handleSubmit}>
          {/* Civilité */}
          <div>
            <label htmlFor="civilite" className="block text-sm mb-1 font-medium">
              Civilité
            </label>
            <select
              id="civilite"
              value={civilite}
              onChange={e => setCivilite(e.target.value)}
              className="w-full border px-3 py-2 rounded-md bg-background"
            >
              {civiliteOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Prénom */}
          <div>
            <label htmlFor="prenom" className="block text-sm mb-1 font-medium">Prénom</label>
            <Input
              id="prenom"
              value={prenom}
              onChange={handlePrenomChange}
              required
              placeholder="Thomas"
              autoComplete="given-name"
            />
            {prenomError && (
              <span className="text-sm text-destructive">{prenomError}</span>
            )}
            <p className="text-xs text-muted-foreground">
              Seules les lettres et le point (.), suivi d&apos;un espace, sont autorisés.
            </p>
          </div>
          {/* Nom complet */}
          <div>
            <label htmlFor="fullName" className="block text-sm mb-1 font-medium">Nom complet</label>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              placeholder="Votre nom complet"
              autoComplete="name"
            />
          </div>
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block text-sm mb-1 font-medium">Nom</label>
            <Input
              id="nom"
              value={nom}
              onChange={e => setNom(e.target.value)}
              required
              placeholder="Votre nom"
              autoComplete="family-name"
            />
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-1 font-medium">E-mail</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              autoComplete="email"
            />
          </div>
          {/* Mot de passe actuel */}
          <div>
            <label htmlFor="motdepasse" className="block text-sm mb-1 font-medium">Mot de passe (actuel)</label>
            <Input
              id="motdepasse"
              type="password"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              required
              placeholder="Votre mot de passe"
              autoComplete="current-password"
            />
            <p className="text-xs text-muted-foreground">Au moins 5 caractères</p>
          </div>
          {/* Nouveau mot de passe */}
          <div>
            <label htmlFor="nvmp" className="block text-sm mb-1 font-medium">
              Nouveau mot de passe <span className="text-xs text-muted-foreground">(Optionnel)</span>
            </label>
            <Input
              id="nvmp"
              type="password"
              value={nvMotDePasse}
              onChange={e => setNvMotDePasse(e.target.value)}
              placeholder="Nouveau mot de passe"
              autoComplete="new-password"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading || !!prenomError}>
              {loading ? "Mise à jour..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
