
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Search } from "lucide-react";
import { Client } from "@/types";
import ClientTable from "./ClientTable";
import ClientDialogs from "./ClientDialogs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ClientManagementProps {
  initialClients?: Client[];
}

const ITEMS_PER_PAGE = 5;

const ClientManagement = ({ initialClients = [] }: ClientManagementProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Fetch profiles from Supabase
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Convert Supabase profiles to Client format
          const formattedClients: Client[] = data.map(profile => ({
            id: profile.id,
            name: profile.full_name || 'Unknown',
            email: profile.email,
            phone: '',  // These fields don't exist in profiles table
            address: '',
            totalOrders: 0,
            totalSpent: 0,
            lastPurchase: new Date().toISOString().split('T')[0],
            accountStatus: profile.role === "admin" ? "active" : "active",
            roles: profile.role || "client"
          }));
          
          setClients(formattedClients);
          setFilteredClients(formattedClients);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

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
          (client.name?.toLowerCase().includes(lowerQuery) || false) || 
          client.email.toLowerCase().includes(lowerQuery) ||
          (client.phone?.includes(searchQuery) || false)
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(client => client.accountStatus === statusFilter);
    }
    
    setFilteredClients(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [clients, searchQuery, statusFilter]);

  const handleAddClient = async () => {
    // This would require adding a new user to Supabase Auth
    // For simplicity, we'll just show a message
    toast.info("Adding new users requires registration through auth system");
    setIsAddClientDialogOpen(false);
  };

  const handleEditClient = async () => {
    if (!currentClient) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: currentClient.name,
          role: currentClient.roles || 'client'
        })
        .eq('id', currentClient.id);
      
      if (error) throw error;
      
      // Update local state
      setClients(
        clients.map((c) => (c.id === currentClient.id ? currentClient : c))
      );
      
      setIsEditClientDialogOpen(false);
      toast.success(`${currentClient.name} has been updated successfully.`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteClient = async () => {
    if (!currentClient) return;
    
    toast.info("Deleting users is not supported through the admin interface");
    setIsDeleteClientDialogOpen(false);
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
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <Button onClick={() => setIsAddClientDialogOpen(true)} disabled={true}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
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

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tekno-blue"></div>
        </div>
      ) : (
        <ClientTable 
          clients={currentItems}
          openEditDialog={openEditClientDialog}
          openDeleteDialog={openDeleteClientDialog}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

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
