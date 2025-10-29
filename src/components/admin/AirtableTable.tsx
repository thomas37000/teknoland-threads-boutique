
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
  onDelete: (artiste: Artistes) => void;
}

const AirtableTable = ({ artistes, onEdit, onDelete }: AirtableTableProps) => {

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
          {artistes && artistes?.sort((a, b) => a.fields.Name.localeCompare(b.fields.Name)).map((artiste) => (
            <TableRow key={artiste.id}>
              <TableCell className="font-semibold">{artiste.fields.Name}</TableCell>
              <TableCell>
                {artiste.fields.styles && artiste.fields.styles.length > 0
                  ? artiste.fields.styles.join(", ")
                  : " "}
              </TableCell>
              <TableCell
                className={`
                  font-semibold
                  ${artiste.fields.Actif === "Compose"
                    ? "text-green-600"
                    : artiste.fields.Actif === "En pause"
                      ? "text-yellow-500"
                      : "text-red-500"}
                `}
              >
                {artiste.fields.Actif}
              </TableCell>

              <TableCell>
                {artiste.fields.Followers !== undefined 
                  ? artiste.fields.Followers.toLocaleString() 
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(artiste)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(artiste)}
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
