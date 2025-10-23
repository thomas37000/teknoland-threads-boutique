import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableRow, TableCell } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { ShopFilter } from "@/hooks/useFilterManagement";

interface FilterTableRowProps {
  filter: ShopFilter;
  onToggleStatus: (filterId: string) => void;
  onEdit: (filter: ShopFilter) => void;
  onDelete: (filterId: string) => void;
}

const getFilterTypeLabel = (type: string) => {
  const labels = {
    category: "Catégorie",
    price: "Prix",
    size: "Taille",
    color: "Couleur",
    stock: "Stock",
    brand: "Marque"
  };
  return labels[type as keyof typeof labels] || type;
};

const FilterTableRow: React.FC<FilterTableRowProps> = ({
  filter,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{filter.name}</TableCell>
      <TableCell>{getFilterTypeLabel(filter.type)}</TableCell>
      <TableCell>
        {filter.options && filter.options.length > 0 
          ? filter.options.slice(0, 3).join(", ") + (filter.options.length > 3 ? "..." : "") 
          : "Auto"
        }
      </TableCell>
      <TableCell>
        <span className={filter.is_active ? "text-green-600" : "text-gray-400"}>
          {filter.is_active ? "Actif" : "Inactif"}
        </span>
      </TableCell>
      <TableCell>{filter.display_order}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(filter.id)}
          >
            <Switch checked={filter.is_active} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(filter)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(filter.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default FilterTableRow;
