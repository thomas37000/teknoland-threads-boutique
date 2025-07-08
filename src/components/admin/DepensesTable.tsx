
import React from "react";
import { DepenseMois } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface DepensesTableProps {
  depenses: DepenseMois[];
  onEdit: (depense: DepenseMois) => void;
  onDelete: (id: string) => void;
}

const DepensesTable = ({ depenses, onEdit, onDelete }: DepensesTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getMonthName = (monthNumber: string) => {
    const months = [
      "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return months[parseInt(monthNumber)] || monthNumber;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Année</TableHead>
            <TableHead>Mois</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Moyenne/Semaine</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {depenses.map((depense) => (
            <TableRow key={depense.id}>
              <TableCell className="font-medium">{depense.annee}</TableCell>
              <TableCell>{getMonthName(depense.mois)}</TableCell>
              <TableCell>{formatCurrency(depense.total)}</TableCell>
              <TableCell>{formatCurrency(depense.semaine_moyenne)}</TableCell>
              <TableCell>{formatDate(depense.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(depense)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(depense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {depenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Aucune dépense trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DepensesTable;
