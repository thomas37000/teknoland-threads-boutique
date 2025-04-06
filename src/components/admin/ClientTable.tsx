
import React from "react";
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
import { Client } from "@/types";

interface ClientTableProps {
  clients: Client[];
  openEditDialog: (client: Client) => void;
  openDeleteDialog: (client: Client) => void;
}

const ClientTable = ({ clients, openEditDialog, openDeleteDialog }: ClientTableProps) => {
  return (
    <Table>
      <TableCaption>A list of all clients.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className="text-right">Total Spent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone}</TableCell>
            <TableCell>{client.totalOrders}</TableCell>
            <TableCell className="text-right">${client.totalSpent.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={client.accountStatus === "active" ? "default" : "outline"}>
                {client.accountStatus}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEditDialog(client)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openDeleteDialog(client)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientTable;
