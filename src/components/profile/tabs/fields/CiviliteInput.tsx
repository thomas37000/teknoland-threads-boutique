
import React from "react";

interface CiviliteInputProps {
  value: string;
  onChange: (value: string) => void;
}
const civiliteOptions = [
  { value: "M", label: "M" },
  { value: "Mme", label: "Mme" },
];
const CiviliteInput: React.FC<CiviliteInputProps> = ({ value, onChange }) => (
  <div>
    <label htmlFor="civilite" className="block text-sm mb-1 font-medium">
      Sexe
    </label>
    <select
      id="civilite"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border px-3 py-2 rounded-md bg-background"
    >
      {civiliteOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
export default CiviliteInput;
