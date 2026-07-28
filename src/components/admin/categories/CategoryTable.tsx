import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CategoryTableRow from "./CategoryTableRow";
import { Category } from "@/hooks/useCategoryManagement";

interface CategoryTableProps {
  categories: Category[];
  onToggleStatus: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ categories, onToggleStatus, onEdit, onDelete }) => (
  <Card>
    <CardHeader>
      <CardTitle>Catégories existantes</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Ordre</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <CategoryTableRow
              key={category.id}
              category={category}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default CategoryTable;