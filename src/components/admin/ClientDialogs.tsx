
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Client } from "@/types";

interface ClientDialogsProps {
  isAddClientDialogOpen: boolean;
  setIsAddClientDialogOpen: (open: boolean) => void;
  isEditClientDialogOpen: boolean;
  setIsEditClientDialogOpen: (open: boolean) => void;
  isDeleteClientDialogOpen: boolean;
  setIsDeleteClientDialogOpen: (open: boolean) => void;
  newClient: Partial<Client>;
  setNewClient: (client: Partial<Client>) => void;
  currentClient: Client | null;
  setCurrentClient: (client: Client | null) => void;
  handleAddClient: () => void;
  handleEditClient: () => void;
  handleDeleteClient: () => void;
}

const ClientDialogs = ({
  isAddClientDialogOpen,
  setIsAddClientDialogOpen,
  isEditClientDialogOpen,
  setIsEditClientDialogOpen,
  isDeleteClientDialogOpen,
  setIsDeleteClientDialogOpen,
  newClient,
  setNewClient,
  currentClient,
  setCurrentClient,
  handleAddClient,
  handleEditClient,
  handleDeleteClient,
}: ClientDialogsProps) => {
  return (
    <>
      {/* Add Client Dialog */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-name" className="text-right">
                Name
              </Label>
              <Input
                id="client-name"
                value={newClient.name || ""}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-email" className="text-right">
                Email
              </Label>
              <Input
                id="client-email"
                type="email"
                value={newClient.email || ""}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="client-phone"
                value={newClient.phone || ""}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-address" className="text-right">
                Address
              </Label>
              <Input
                id="client-address"
                value={newClient.address || ""}
                onChange={(e) =>
                  setNewClient({ ...newClient, address: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-orders" className="text-right">
                Total Orders
              </Label>
              <Input
                id="client-orders"
                type="number"
                value={newClient.totalOrders || 0}
                onChange={(e) =>
                  setNewClient({ ...newClient, totalOrders: parseInt(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-spent" className="text-right">
                Total Spent
              </Label>
              <Input
                id="client-spent"
                type="number"
                step="0.01"
                value={newClient.totalSpent || 0}
                onChange={(e) =>
                  setNewClient({ ...newClient, totalSpent: parseFloat(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-client-name"
                value={currentClient?.name || ""}
                onChange={(e) =>
                  setCurrentClient(
                    currentClient
                      ? { ...currentClient, name: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-client-email"
                type="email"
                value={currentClient?.email || ""}
                onChange={(e) =>
                  setCurrentClient(
                    currentClient
                      ? { ...currentClient, email: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-client-phone"
                value={currentClient?.phone || ""}
                onChange={(e) =>
                  setCurrentClient(
                    currentClient
                      ? { ...currentClient, phone: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client-address" className="text-right">
                Address
              </Label>
              <Input
                id="edit-client-address"
                value={currentClient?.address || ""}
                onChange={(e) =>
                  setCurrentClient(
                    currentClient
                      ? { ...currentClient, address: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client-orders" className="text-right">
                Total Orders
              </Label>
              <Input
                id="edit-client-orders"
                type="number"
                value={currentClient?.totalOrders || 0}
                onChange={(e) =>
                  setCurrentClient(
                    currentClient
                      ? { ...currentClient, totalOrders: parseInt(e.target.value) }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client-spent" className="text-right">
                Total Spent
              </Label>
              <Input
                id="edit-client-spent"
                type="number"
                step="0.01"
                value={currentClient?.totalSpent || 0}
                onChange={(e) =>
                  setCurrentClient(
                    currentClient
                      ? { ...currentClient, totalSpent: parseFloat(e.target.value) }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client-status" className="text-right">
                Status
              </Label>
              <select
                id="edit-client-status"
                value={currentClient?.accountStatus || "active"}
                onChange={(e) =>
                  setCurrentClient(
                    currentClient
                      ? { ...currentClient, accountStatus: e.target.value as "active" | "inactive" }
                      : null
                  )
                }
                className="col-span-3 px-3 py-2 border rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client-role" className="text-right">
                Rôle
              </Label>
              <select
                id="edit-client-role"
                value={currentClient?.roles || "client"}
                onChange={(e) =>
                  setCurrentClient(
                    currentClient
                      ? { ...currentClient, roles: e.target.value as "client" | "admin" | "seller" }
                      : null
                  )
                }
                className="col-span-3 px-3 py-2 border rounded-md"
              >
                <option value="client">Client</option>
                <option value="seller">Vendeur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClientDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditClient}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteClientDialogOpen} onOpenChange={setIsDeleteClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete client "{currentClient?.name}"? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteClientDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientDialogs;
