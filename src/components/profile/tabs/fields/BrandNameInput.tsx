import React from "react";
import { Input } from "@/components/ui/input";

interface BrandNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BrandNameInput: React.FC<BrandNameInputProps> = ({ value, onChange }) => (
  <div>
    <label htmlFor="brandName" className="block text-sm mb-1 font-medium">Nom de marque</label>
    <Input
      id="brandName"
      value={value}
      onChange={onChange}
      placeholder="Nom de votre marque (optionnel)"
      autoComplete="organization"
    />
    <p className="text-xs text-gray-500 mt-1">
      Ce nom sera affiché sur vos produits à la place de votre nom complet
    </p>
  </div>
);

export default BrandNameInput;