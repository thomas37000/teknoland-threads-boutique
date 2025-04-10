import { useState, useEffect } from "react";
import { Client } from "@/types";
import ClientTable from "./ClientTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) throw error;
        
        // Transform the data to match the Client interface
        if (data) {
          const transformedClients: Client[] = data.map(profile => ({
            id: profile.id || "",
            name: profile.name || "No Name",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            totalOrders: profile.totalOrders || 0,
            totalSpent: profile.totalSpent || 0,
            lastPurchase: profile.lastPurchase || "",
            accountStatus: (profile.accountStatus as "active" | "inactive") || "active",
            roles: (profile.roles as "client" | "admin") || "client",
            cookieConsent: profile.cookieConsent,
            cookieConsentDate: profile.cookieConsentDate
          }));
          
          setClients(transformedClients);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleEdit = async (client: Client) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: client.name,
          phone: client.phone,
          address: client.address,
          accountStatus: client.accountStatus,
          roles: client.roles
        })
        .eq('id', client.id);
      
      if (error) throw error;
      
      setClients(prevClients => 
        prevClients.map(c => c.id === client.id ? client : c)
      );
      
      toast.success("Client mis à jour avec succès");
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erreur lors de la mise à jour du client");
    }
    
    setIsEditDialogOpen(false);
    setSelectedClient(null);
  };

  const handleOpenEditDialog = (client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  const filteredClients = clients.filter(client => {
    return (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ClientTable
        clients={filteredClients}
        isLoading={isLoading}
        onEdit={handleOpenEditDialog}
      />

      {/* The actual dialogs are imported from ClientDialogs.tsx */}
    </div>
  );
};

export default ClientManagement;
