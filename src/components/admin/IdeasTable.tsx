import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Ideas } from "@/types";

interface IdeasTableProps {
  ideas: Ideas[];
  openEditDialog: (idea: Ideas) => void;
  openDeleteDialog: (idea: Ideas) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const IdeasTable = ({
  ideas,
  openEditDialog,
  openDeleteDialog,
}: IdeasTableProps) => {
  return (
    <div>
      <Table>
        <TableCaption>Tous les idées.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>idées</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                Idées non trouvé !
              </TableCell>
            </TableRow>
          ) : (
            ideas.map((idea) => (
              <TableRow key={idea.id}>
                <TableCell className="font-medium">{idea.id}</TableCell>
                <TableCell>{idea.desc}</TableCell>

                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(idea)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDeleteDialog(idea)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default IdeasTable;
