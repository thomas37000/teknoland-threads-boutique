
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Client } from "@/types";
import ClientTable from "./ClientTable";
import ClientDialogs from "./ClientDialogs";
import { toast } from "@/hooks/use-toast";

interface ClientManagementProps {
  initialClients: Client[];
}

const ClientManagement = ({ initialClients }: ClientManagementProps) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isDeleteClientDialogOpen, setIsDeleteClientDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    totalOrders: 0,
    totalSpent: 0,
    lastPurchase: new Date().toISOString().split('T')[0],
    accountStatus: "active"
  });

  const handleAddClient = () => {
    const clientToAdd = {
      ...newClient,
      id: String(Date.now()), // Generate a unique ID
      totalOrders: Number(newClient.totalOrders) || 0,
      totalSpent: Number(newClient.totalSpent) || 0,
    } as Client;
    
    setClients([...clients, clientToAdd]);
    setNewClient({
      id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      totalOrders: 0,
      totalSpent: 0,
      lastPurchase: new Date().toISOString().split('T')[0],
      accountStatus: "active"
    });
    setIsAddClientDialogOpen(false);
    toast({
      title: "Client added",
      description: `${clientToAdd.name} has been added successfully.`
    });
  };

  const handleEditClient = () => {
    if (!currentClient) return;
    
    const updatedClient = {
      ...currentClient,
      totalOrders: Number(currentClient.totalOrders) || 0,
      totalSpent: Number(currentClient.totalSpent) || 0,
    };
    
    setClients(
      clients.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    setIsEditClientDialogOpen(false);
    toast({
      title: "Client updated",
      description: `${updatedClient.name} has been updated successfully.`
    });
  };

  const handleDeleteClient = () => {
    if (!currentClient) return;
    
    setClients(clients.filter((c) => c.id !== currentClient.id));
    setIsDeleteClientDialogOpen(false);
    toast({
      title: "Client deleted",
      description: `${currentClient.name} has been deleted successfully.`
    });
  };

  const openEditClientDialog = (client: Client) => {
    setCurrentClient(client);
    setIsEditClientDialogOpen(true);
  };

  const openDeleteClientDialog = (client: Client) => {
    setCurrentClient(client);
    setIsDeleteClientDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Clients</h2>
        <Button onClick={() => setIsAddClientDialogOpen(true)}>
          <Plus className="mr-2" />
          Add Client
        </Button>
      </div>

      <ClientTable 
        clients={clients}
        openEditDialog={openEditClientDialog}
        openDeleteDialog={openDeleteClientDialog}
      />

      <ClientDialogs 
        isAddClientDialogOpen={isAddClientDialogOpen}
        setIsAddClientDialogOpen={setIsAddClientDialogOpen}
        isEditClientDialogOpen={isEditClientDialogOpen}
        setIsEditClientDialogOpen={setIsEditClientDialogOpen}
        isDeleteClientDialogOpen={isDeleteClientDialogOpen}
        setIsDeleteClientDialogOpen={setIsDeleteClientDialogOpen}
        newClient={newClient}
        setNewClient={setNewClient}
        currentClient={currentClient}
        setCurrentClient={setCurrentClient}
        handleAddClient={handleAddClient}
        handleEditClient={handleEditClient}
        handleDeleteClient={handleDeleteClient}
      />
    </div>
  );
};

export default ClientManagement;
