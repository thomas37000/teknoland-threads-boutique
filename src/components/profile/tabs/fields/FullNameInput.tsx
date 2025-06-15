
import React from "react";
import { Input } from "@/components/ui/input";

interface FullNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FullNameInput: React.FC<FullNameInputProps> = ({ value, onChange }) => (
  <div>
    <label htmlFor="fullName" className="block text-sm mb-1 font-medium">Nom complet</label>
    <Input
      id="fullName"
      value={value}
      onChange={onChange}
      required
      placeholder="Votre nom complet"
      autoComplete="name"
    />
  </div>
);

export default FullNameInput;
