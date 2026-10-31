import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormRow } from "./FormRow";

export type ImageOption = { value: string; label: string };

/** Variations couleur/taille/stock (T-shirts, sweats…). */
export function VariationsEditor({
  variations = [], imageOptions, colorOptions, sizeOptions, onAdd, onRemove, onUpdate,
}: {
  variations: any[];
  imageOptions: ImageOption[];
  colorOptions: string[];
  sizeOptions: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: any) => void;
}) {
  const SimpleSelect = ({ value, options, field, index }: { value: string; options: string[]; field: string; index: number }) => (
    <Select value={value} onValueChange={(v) => onUpdate(index, field, v)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent position="popper">
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <FormRow label="Variations" align="start">
      <div className="space-y-4">
        {variations.map((variation, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Variation {index + 1}</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => onRemove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-sm">Image</Label>
                <div className="space-y-2">
                  <Select value={variation.image || ""} onValueChange={(v) => onUpdate(index, "image", v)}>
                    <SelectTrigger><SelectValue placeholder="Choisir image" /></SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px]">
                      {imageOptions.map((o, i) => (
                        <SelectItem key={`${i}-${o.value}`} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {variation.image && (
                    <img src={variation.image} alt={`Variation ${index + 1}`} className="w-12 h-12 object-cover rounded border" />
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm">Couleur</Label>
                <SimpleSelect value={variation.color} options={colorOptions} field="color" index={index} />
              </div>
              <div>
                <Label className="text-sm">Taille</Label>
                <SimpleSelect value={variation.size} options={sizeOptions} field="size" index={index} />
              </div>
              <div>
                <Label className="text-sm">Stock</Label>
                <Input type="number" min="0" value={variation.stock} onChange={(e) => onUpdate(index, "stock", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={onAdd} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une variation
        </Button>
        {variations.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Stock total: {variations.reduce((sum, v) => sum + v.stock, 0)} unités
          </div>
        )}
      </div>
    </FormRow>
  );
}
