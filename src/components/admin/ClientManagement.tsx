
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Search } from "lucide-react";
import { Client } from "@/types";
import ClientTable from "./ClientTable";
import ClientDialogs from "./ClientDialogs";
import { toast } from "@/hooks/use-toast";

interface ClientManagementProps {
  initialClients: Client[];
}

const ITEMS_PER_PAGE = 5;

const ClientManagement = ({ initialClients }: ClientManagementProps) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [filteredClients, setFilteredClients] = useState<Client[]>(initialClients);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog states
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

  // Calculate total pages
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  
  // Current page items
  const currentItems = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Apply filters when dependencies change
  useEffect(() => {
    let result = [...clients];
    
    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        client => 
          client.name.toLowerCase().includes(lowerQuery) || 
          client.email.toLowerCase().includes(lowerQuery) ||
          client.phone.includes(searchQuery)
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(client => client.accountStatus === statusFilter);
    }
    
    setFilteredClients(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [clients, searchQuery, statusFilter]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Clients</h2>
        <Button onClick={() => setIsAddClientDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ClientTable 
        clients={currentItems}
        openEditDialog={openEditClientDialog}
        openDeleteDialog={openDeleteClientDialog}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
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
