
import React from "react";
import { Artistes } from "@/types";
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

interface AirtableTableProps {
  artistes: Artistes[];
  onEdit: (artiste: Artistes) => void;
  onDelete: (id: string) => void;
}

const AirtableTable = ({ artistes }: AirtableTableProps) => {

  function onDelete(Name: string): void {
    throw new Error("Function not implemented.");
  }

   function onEdit(Name: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Styles</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead>Nombre Abonnés</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artistes && artistes?.map((artiste) => (
            <TableRow key={artiste.id}>
              <TableCell>{artiste.fields.Name}</TableCell>
              <TableCell>
                {artiste.fields.styles && artiste.fields.styles.length > 0
                  ? artiste.fields.styles.join(", ")
                  : " "}
              </TableCell>
              <TableCell>{artiste.fields.Actif}</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(artiste.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(artiste.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {artistes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Aucun artistes trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AirtableTable;
