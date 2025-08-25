
import { useState, useEffect } from "react";
import { Client } from "@/types";
import ClientTable from "./ClientTable";
import PopupAdmin from "./PopupAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform the data to match the Client interface
        if (data) {
          const transformedClients: Client[] = data.map(profile => ({
            id: profile.id || "",
            name: profile.full_name || profile.firstname || "No Name",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            totalOrders: profile.totalOrders || 0,
            totalSpent: profile.totalSpent || 0,
            lastPurchase: profile.lastPurchase || "",
            accountStatus: (profile.accountStatus as "active" | "inactive") || "active",
            roles: (profile.roles as "client" | "admin" | "seller") || "client",
            cookieConsent: false,
            cookieConsentDate: ""
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
          full_name: client.name,
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

  const handleDelete = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', clientId);
      
      if (error) throw error;
      
      setClients(prevClients => 
        prevClients.filter(c => c.id !== clientId)
      );
      
      toast.success("Client supprimé avec succès");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erreur lors de la suppression du client");
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  const handleOpenEditDialog = (client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const filteredClients = clients.filter(client => {
    return (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un client..."
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
              disabled
            />
          </div>
        </div>
        <TableSkeleton rows={5} columns={6} />
      </div>
    );
  }

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
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Edit Dialog */}
      {isEditDialogOpen && selectedClient && (
        <ClientEditDialog
          client={selectedClient}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedClient(null);
          }}
          onSave={handleEdit}
        />
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && selectedClient && (
        <ClientDeleteDialog
          client={selectedClient}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedClient(null);
          }}
          onConfirm={() => handleDelete(selectedClient.id)}
        />
      )}
    </div>
  );
};

// Edit Dialog Component
const ClientEditDialog = ({ client, isOpen, onClose, onSave }: {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
}) => {
  const [editedClient, setEditedClient] = useState(client);

  const handleSave = () => {
    onSave(editedClient);
  };

  return (
    <PopupAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le client"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            value={editedClient.name}
            onChange={(e) => setEditedClient({...editedClient, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            type="text"
            value={editedClient.phone}
            onChange={(e) => setEditedClient({...editedClient, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Adresse</label>
          <input
            type="text"
            value={editedClient.address}
            onChange={(e) => setEditedClient({...editedClient, address: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select
            value={editedClient.accountStatus}
            onChange={(e) => setEditedClient({...editedClient, accountStatus: e.target.value as "active" | "inactive"})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Rôle</label>
          <select
            value={editedClient.roles}
            onChange={(e) => setEditedClient({...editedClient, roles: e.target.value as "client" | "admin" | "seller"})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="client">Client</option>
            <option value="seller">Vendeur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleSave}
          className="flex-1 bg-tekno-blue text-white py-2 rounded-md hover:bg-tekno-blue/90"
        >
          Sauvegarder
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
        >
          Annuler
        </button>
      </div>
    </PopupAdmin>
  );
};

// Delete Dialog Component
const ClientDeleteDialog = ({ client, isOpen, onClose, onConfirm }: {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <PopupAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer le client"
    >
      <p className="text-gray-600 mb-6">
        Êtes-vous sûr de vouloir supprimer le client <strong>{client.name}</strong> ? 
        Cette action est irréversible.
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
        >
          Supprimer
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
        >
          Annuler
        </button>
      </div>
    </PopupAdmin>
  );
};

export default ClientManagement;
