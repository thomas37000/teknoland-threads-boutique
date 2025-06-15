
import React from "react";
import { Input } from "@/components/ui/input";

interface EmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({ value, onChange, readOnly }) => (
  <div>
    <label htmlFor="email" className="block text-sm mb-1 font-medium">E-mail</label>
    <Input
      id="email"
      type="email"
      value={value}
      onChange={onChange}
      required
      placeholder="votre@email.com"
      readOnly={readOnly}
      autoComplete="email"
      className={readOnly ? "bg-muted" : ""}
    />
  </div>
);

export default EmailInput;
