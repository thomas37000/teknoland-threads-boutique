
import React from "react";
import { Input } from "@/components/ui/input";

interface NomInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NomInput: React.FC<NomInputProps> = ({ value, onChange }) => (
  <div>
    <label htmlFor="nom" className="block text-sm mb-1 font-medium">Nom</label>
    <Input
      id="nom"
      value={value}
      onChange={onChange}
      required
      placeholder="Nom"
      autoComplete="family-name"
    />
  </div>
);

export default NomInput;
