
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SortSelectProps {
  sortOption: string;
  onSortChange: (value: string) => void;
}

const SortSelect = ({ sortOption, onSortChange }: SortSelectProps) => {
  return (
    <div className="w-full sm:w-auto">
      <h3 className="text-sm font-medium mb-2">Trier par</h3>
      <Select value={sortOption} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Plus récent</SelectItem>
          <SelectItem value="price-low">Prix : croissant</SelectItem>
          <SelectItem value="price-high">Prix : décroissant</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortSelect;
