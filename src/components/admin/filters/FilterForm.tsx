import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterFormProps {
  name: string;
  type: string;
  options: string;
  isActive: boolean;
  onNameChange: (value: string) => void;
  onTypeChange?: (value: string) => void;
  onOptionsChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
  showTypeSelector?: boolean;
}

const FilterForm: React.FC<FilterFormProps> = ({
  name,
  type,
  options,
  isActive,
  onNameChange,
  onTypeChange,
  onOptionsChange,
  onIsActiveChange,
  showTypeSelector = true
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="filter-name">Nom du filtre</Label>
        <Input
          id="filter-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: Marque"
        />
      </div>
      
      {showTypeSelector && onTypeChange && (
        <div>
          <Label htmlFor="filter-type">Type de filtre</Label>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="category">Catégorie</SelectItem>
              <SelectItem value="price">Prix</SelectItem>
              <SelectItem value="size">Taille</SelectItem>
              <SelectItem value="color">Couleur</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="brand">Marque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <Label htmlFor="filter-options">Options (séparées par des virgules)</Label>
        <Input
          id="filter-options"
          value={options}
          onChange={(e) => onOptionsChange(e.target.value)}
          placeholder="Ex: Nike, Adidas, Puma"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="filter-active"
          checked={isActive}
          onCheckedChange={onIsActiveChange}
        />
        <Label htmlFor="filter-active">Filtre actif</Label>
      </div>
    </div>
  );
};

export default FilterForm;
