import { useState, useEffect } from "react";
import { Client } from "@/types";
import ClientTable from "./ClientTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

const SellerClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Fetch only clients who have purchased seller's products
  useEffect(() => {
    const fetchSellerClients = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get orders for products sold by this seller
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            user_id,
            order_items!inner(
              product_id,
              products!inner(seller_id)
            )
          `)
          .eq('order_items.products.seller_id', user.id);

        if (orderError) throw orderError;

        // Extract unique client IDs
        const clientIds = [...new Set(orderData?.map(order => order.user_id) || [])];

        if (clientIds.length === 0) {
          setClients([]);
          setIsLoading(false);
          return;
        }

        // Fetch client profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', clientIds)
          .order('updated_at', { ascending: false });
        
        if (profileError) throw profileError;
        
        // Transform the data to match the Client interface
        if (profileData) {
          const transformedClients: Client[] = profileData.map(profile => ({
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
        console.error("Error fetching seller clients:", error);
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerClients();
  }, [user]);

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
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun client n'a encore acheté vos produits.</p>
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
        onEdit={() => {}} // Sellers can't edit clients
        onDelete={() => {}} // Sellers can't delete clients
        showActions={false} // Hide edit/delete actions for sellers
      />
    </div>
  );
};

export default SellerClientManagement;