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
import { useAuth } from "@/hooks/use-auth";
import CiviliteInput from "./fields/CiviliteInput";
import PrenomInput from "./fields/PrenomInput";
import NomInput from "./fields/NomInput";
import AdresseInput from "./fields/AdresseInput";
import BrandNameInput from "./fields/BrandNameInput";
// On retire maintenant FullNameInput et EmailInput

interface UpdateProfileDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const civiliteOptions = [
  { value: "M", label: "M" },
  { value: "Mme", label: "Mme" },
];

const sexeOptions = [
  { value: "M", label: "M" },
  { value: "Mme", label: "Mme" },
  { value: "Autre", label: "Autre" },
];

const passwordCreationRules = [
  "Au moins 8 caractères",
  "Au moins une lettre majuscule",
  "Au moins une lettre minuscule",
  "Au moins un chiffre",
  "Au moins un caractère spécial",
];

function validePrenom(value: string) {
  return /^[A-Za-zÀ-ÿ.\s]+$/.test(value);
}

const UpdateProfileDialog: React.FC<UpdateProfileDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const { userRole } = useAuth();
  // Préremplissage depuis user_metadata si dispo
  const [civilite, setCivilite] = useState(
    user?.user_metadata?.civilite || "M"
  );
  const [prenom, setPrenom] = useState(
    user?.user_metadata?.prenom || ""
  );
  // Suppression de fullName
  const [nom, setNom] = useState(
    user?.user_metadata?.nom || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [motDePasse, setMotDePasse] = useState("");
  const [nvMotDePasse, setNvMotDePasse] = useState("");
  const [adresse, setAdresse] = useState(user?.user_metadata?.adresse || "");
  const [brandName, setBrandName] = useState(user?.user_metadata?.brand_name || "");
  const [loading, setLoading] = useState(false);
  const [prenomError, setPrenomError] = useState<string | null>(null);

  React.useEffect(() => {
    setCivilite(user?.user_metadata?.civilite || "M");
    setPrenom(user?.user_metadata?.prenom || "");
    setNom(user?.user_metadata?.nom || "");
    setEmail(user?.email || "");
    setBrandName(user?.user_metadata?.brand_name || "");
    setMotDePasse("");
    setNvMotDePasse("");
    setPrenomError(null);
  }, [user, open]);

  const handlePrenomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrenom(e.target.value);
    setPrenomError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prenom) {
      setPrenomError("Champ obligatoire.");
      return;
    }
    if (!nom) {
      toast({
        title: "Erreur",
        description: "Merci de renseigner votre nom.",
      });
      return;
    }
    if (nvMotDePasse) {
      const { isValid, errors } = (await import("@/utils/passwordValidation")).validatePassword(nvMotDePasse);
      if (!isValid) {
        toast({
          title: "Erreur",
          description: errors.join(" / "),
        });
        return;
      }
    }
    if (!motDePasse || motDePasse.length < 5) {
      toast({
        title: "Erreur",
        description: "Le mot de passe actuel doit contenir au moins 5 caractères.",
      });
      return;
    }

    setLoading(true);

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

    let errorAuth, errorMeta, errorNewPass, errorProfile;

    if (email && email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) errorAuth = error;
    }

    const userMetadataUpdate: any = {};
    if (prenom !== user?.user_metadata?.prenom) userMetadataUpdate.prenom = prenom;
    if (civilite !== user?.user_metadata?.civilite) userMetadataUpdate.civilite = civilite;
    if (nom !== user?.user_metadata?.nom) userMetadataUpdate.nom = nom;
    if (adresse !== user?.user_metadata?.adresse) userMetadataUpdate.adresse = adresse;
    if (brandName !== user?.user_metadata?.brand_name) userMetadataUpdate.brand_name = brandName;
    if (Object.keys(userMetadataUpdate).length > 0) {
      const { error } = await supabase.auth.updateUser({ data: userMetadataUpdate });
      if (error) errorMeta = error;
    }
    // Update dans profiles (table)
    const updates: any = {};
    if (prenom) updates.firstname = prenom;
    if (nom) updates.lastname = nom;
    if (adresse) updates.address = adresse;
    if (brandName) updates.brand_name = brandName;
    // On n'update plus full_name
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) errorProfile = error;
    }
    if (nvMotDePasse && nvMotDePasse.length >= 5) {
      const { error } = await supabase.auth.updateUser({ password: nvMotDePasse });
      if (error) errorNewPass = error;
    }

    setLoading(false);

    if (!errorAuth && !errorMeta && !errorNewPass && !errorProfile) {
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
        errorProfile?.message ||
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
          <DialogTitle>Modifier mes informations</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 py-2" onSubmit={handleSubmit}>
          {/* Civilité (Sexe) */}
          <CiviliteInput value={civilite} onChange={setCivilite} />

          {/* Prénom */}
          <PrenomInput value={prenom} onChange={handlePrenomChange} error={prenomError} />

          {/* Nom */}
          <NomInput value={nom} onChange={e => setNom(e.target.value)} />

          {/* Adresse (non obligatoire) */}
          <AdresseInput value={adresse} onChange={e => setAdresse(e.target.value)} />

          {/* Nom de marque (non obligatoire - seulement pour les vendeurs) */}
          {userRole === 'seller' && (
            <BrandNameInput value={brandName} onChange={e => setBrandName(e.target.value)} />
          )}

          {/* Email (modifiable, cf sécurité) */}
          {/* On garde la possibilité d'édition d'e-mail, mais on enlève l'input Utilisateur en lecture seule */}
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
            <ul className="text-xs text-muted-foreground list-disc list-inside pl-2 mt-1">
              {passwordCreationRules.map(rule => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
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
