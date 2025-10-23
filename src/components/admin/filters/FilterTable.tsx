import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter } from "lucide-react";
import FilterTableRow from "./FilterTableRow";
import { ShopFilter } from "@/hooks/useFilterManagement";

interface FilterTableProps {
  filters: ShopFilter[];
  onToggleStatus: (filterId: string) => void;
  onEdit: (filter: ShopFilter) => void;
  onDelete: (filterId: string) => void;
}

const FilterTable: React.FC<FilterTableProps> = ({
  filters,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres configurés
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filters.map((filter) => (
              <FilterTableRow
                key={filter.id}
                filter={filter}
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
};

export default FilterTable;
