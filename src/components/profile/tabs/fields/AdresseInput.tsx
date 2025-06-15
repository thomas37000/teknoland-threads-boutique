
import React from "react";
import { Input } from "@/components/ui/input";

interface AdresseInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdresseInput: React.FC<AdresseInputProps> = ({ value, onChange }) => (
  <div>
    <label htmlFor="adresse" className="block text-sm mb-1 font-medium">
      Adresse (optionnelle)
    </label>
    <Input
      id="adresse"
      value={value}
      onChange={onChange}
      placeholder="Adresse (facultatif)"
      autoComplete="street-address"
    />
  </div>
);

export default AdresseInput;
