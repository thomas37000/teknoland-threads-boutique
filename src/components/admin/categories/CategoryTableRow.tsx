import React from "react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { Category } from "@/hooks/useCategoryManagement";

interface CategoryTableRowProps {
  category: Category;
  onToggleStatus: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryTableRow: React.FC<CategoryTableRowProps> = ({ category, onToggleStatus, onEdit, onDelete }) => (
  <TableRow>
    <TableCell className="font-medium">{category.name}</TableCell>
    <TableCell>{category.slug}</TableCell>
    <TableCell>{category.description || "-"}</TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        {category.is_active ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
        <span className={category.is_active ? "text-green-600" : "text-gray-400"}>
          {category.is_active ? "Visible" : "Cachée"}
        </span>
      </div>
    </TableCell>
    <TableCell>{category.display_order}</TableCell>
    <TableCell>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => onToggleStatus(category.id)}>
          {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(category.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

export default CategoryTableRow;