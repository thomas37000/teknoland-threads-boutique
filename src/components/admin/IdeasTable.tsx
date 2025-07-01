
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
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Idea } from "@/types";

interface IdeasTableProps {
  ideas: Idea[];
  openEditDialog: (idea: Idea) => void;
  openDeleteDialog: (idea: Idea) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'Haute';
    case 'medium':
      return 'Moyenne';
    case 'low':
      return 'Basse';
    default:
      return priority;
  }
};

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
            <TableHead>Idées</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10">
                Idées non trouvé !
              </TableCell>
            </TableRow>
          ) : (
            ideas.map((idea) => (
              <TableRow key={idea.id}>
                <TableCell className="font-medium">{idea.id}</TableCell>
                <TableCell>{idea.desc}</TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(idea.priority)}>
                    {getPriorityLabel(idea.priority)}
                  </Badge>
                </TableCell>
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
