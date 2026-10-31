import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Ligne de formulaire « label à gauche / champ sur 3 colonnes ». */
export function FormRow({
  label,
  htmlFor,
  align = "center",
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  align?: "center" | "start";
  children: ReactNode;
}) {
  return (
    <div className={`grid grid-cols-4 gap-4 ${align === "start" ? "items-start" : "items-center"}`}>
      <Label htmlFor={htmlFor} className={`text-right ${align === "start" ? "pt-2" : ""}`}>
        {label}
      </Label>
      <div className="col-span-3">{children}</div>
    </div>
  );
}
