// ProductField.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ProductField({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (val: any) => void;
  type?: string;
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? +e.target.value : e.target.value)}
        className="col-span-3"
      />
    </div>
  );
}
