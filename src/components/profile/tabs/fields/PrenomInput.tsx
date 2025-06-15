
import React from "react";
import { Input } from "@/components/ui/input";

interface PrenomInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
}
const PrenomInput: React.FC<PrenomInputProps> = ({ value, onChange, error }) => (
  <div>
    <label htmlFor="prenom" className="block text-sm mb-1 font-medium">
      Prénom
    </label>
    <Input
      id="prenom"
      value={value}
      onChange={onChange}
      required
      placeholder="Prénom"
      autoComplete="given-name"
    />
    {error && (
      <span className="text-sm text-destructive">{error}</span>
    )}
  </div>
);

export default PrenomInput;
