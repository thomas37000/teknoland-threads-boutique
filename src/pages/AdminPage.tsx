
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Package, Users } from "lucide-react";
import { Product, Client } from "@/types";
import { products as initialProducts } from "@/data/products";
import { toast } from "@/hooks/use-toast";

// Fake clients data
const initialClients: Client[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, CA 94321",
    totalOrders: 5,
    totalSpent: 849.95,
    lastPurchase: "2023-12-15",
    accountStatus: "active"
  },
  {
    id: "2",
    name: "Emma Johnson",
    email: "emma.j@example.com",
    phone: "(555) 234-5678",
    address: "456 Oak Ave, Somewhere, NY 10001",
    totalOrders: 3,
    totalSpent: 329.85,
    lastPurchase: "2023-11-28",
    accountStatus: "active"
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "(555) 345-6789",
    address: "789 Pine St, Nowhere, TX 75001",
    totalOrders: 8,
    totalSpent: 1249.50,
    lastPurchase: "2024-01-05",
    accountStatus: "active"
  },
  {
    id: "4",
    name: "Sophia Williams",
    email: "sophia.w@example.com",
    phone: "(555) 456-7890",
    address: "321 Elm St, Anyplace, WA 98001",
    totalOrders: 2,
    totalSpent: 159.90,
    lastPurchase: "2023-10-12",
    accountStatus: "inactive"
  },
  {
    id: "5",
    name: "David Miller",
    email: "david.m@example.com",
    phone: "(555) 567-8901",
    address: "654 Cedar Rd, Somewhere, FL 33001",
    totalOrders: 6,
    totalSpent: 920.75,
    lastPurchase: "2023-12-28",
    accountStatus: "active"
  },
  {
    id: "6",
    name: "Olivia Davis",
    email: "olivia.d@example.com",
    phone: "(555) 678-9012",
    address: "987 Birch Ln, Anywhere, IL 60001",
    totalOrders: 4,
    totalSpent: 499.80,
    lastPurchase: "2023-11-15",
    accountStatus: "active"
  },
  {
    id: "7",
    name: "James Wilson",
    email: "james.w@example.com",
    phone: "(555) 789-0123",
    address: "246 Maple Dr, Nowhere, GA 30001",
    totalOrders: 1,
    totalSpent: 89.95,
    lastPurchase: "2023-09-20",
    accountStatus: "inactive"
  },
  {
    id: "8",
    name: "Isabella Taylor",
    email: "isabella.t@example.com",
    phone: "(555) 890-1234",
    address: "135 Walnut Ave, Someplace, OH 44001",
    totalOrders: 7,
    totalSpent: 1079.65,
    lastPurchase: "2024-01-10",
    accountStatus: "active"
  },
  {
    id: "9",
    name: "Ethan Anderson",
    email: "ethan.a@example.com",
    phone: "(555) 901-2345",
    address: "864 Spruce Ct, Anytown, MI 48001",
    totalOrders: 3,
    totalSpent: 359.85,
    lastPurchase: "2023-12-05",
    accountStatus: "active"
  },
  {
    id: "10",
    name: "Ava Thomas",
    email: "ava.t@example.com",
    phone: "(555) 012-3456",
    address: "579 Ash St, Somewhere, AZ 85001",
    totalOrders: 5,
    totalSpent: 729.75,
    lastPurchase: "2023-11-30",
    accountStatus: "active"
  }
];

// Add stock to initial products
const productsWithStock = initialProducts.map(product => ({
  ...product,
  stock: Math.floor(Math.random() * 100) + 1 // Random stock between 1 and 100
}));

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>(productsWithStock);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isDeleteClientDialogOpen, setIsDeleteClientDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    stock: 0,
  });
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

  // Product CRUD operations
  const handleAddProduct = () => {
    const productToAdd = {
      ...newProduct,
      id: String(Date.now()), // Generate a unique ID
      price: Number(newProduct.price) || 0,
      stock: Number(newProduct.stock) || 0,
    } as Product;
    
    setProducts([...products, productToAdd]);
    setNewProduct({
      id: "",
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "",
      stock: 0,
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Product added",
      description: `${productToAdd.name} has been added successfully.`
    });
  };

  const handleEditProduct = () => {
    if (!currentProduct) return;
    
    const updatedProduct = {
      ...currentProduct,
      price: Number(currentProduct.price) || 0,
      stock: Number(currentProduct.stock) || 0,
    };
    
    setProducts(
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setIsEditDialogOpen(false);
    toast({
      title: "Product updated",
      description: `${updatedProduct.name} has been updated successfully.`
    });
  };

  const handleDeleteProduct = () => {
    if (!currentProduct) return;
    
    setProducts(products.filter((p) => p.id !== currentProduct.id));
    setIsDeleteDialogOpen(false);
    toast({
      title: "Product deleted",
      description: `${currentProduct.name} has been deleted successfully.`
    });
  };

  // Client CRUD operations
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

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
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
    <div className="tekno-container py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Products</h2>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2" />
              Add Product
            </Button>
          </div>

          <Table>
            <TableCaption>A list of all products.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {product.stock <= 5 ? (
                      <span className="text-red-500 font-medium">{product.stock}</span>
                    ) : (
                      product.stock
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteDialog(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="clients">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Clients</h2>
            <Button onClick={() => setIsAddClientDialogOpen(true)}>
              <Plus className="mr-2" />
              Add Client
            </Button>
          </div>

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
                        onClick={() => openEditClientDialog(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteClientDialog(client)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Product Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newProduct.name || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                value={newProduct.category || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={newProduct.stock || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                value={newProduct.image || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newProduct.description || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={currentProduct?.name || ""}
                onChange={(e) =>
                  setCurrentProduct(
                    currentProduct
                      ? { ...currentProduct, name: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Input
                id="edit-category"
                value={currentProduct?.category || ""}
                onChange={(e) =>
                  setCurrentProduct(
                    currentProduct
                      ? { ...currentProduct, category: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price
              </Label>
              <Input
                id="edit-price"
                type="number"
                value={currentProduct?.price || ""}
                onChange={(e) =>
                  setCurrentProduct(
                    currentProduct
                      ? { ...currentProduct, price: parseFloat(e.target.value) }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-stock" className="text-right">
                Stock
              </Label>
              <Input
                id="edit-stock"
                type="number"
                value={currentProduct?.stock || ""}
                onChange={(e) =>
                  setCurrentProduct(
                    currentProduct
                      ? { ...currentProduct, stock: parseInt(e.target.value) }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">
                Image URL
              </Label>
              <Input
                id="edit-image"
                value={currentProduct?.image || ""}
                onChange={(e) =>
                  setCurrentProduct(
                    currentProduct
                      ? { ...currentProduct, image: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                value={currentProduct?.description || ""}
                onChange={(e) =>
                  setCurrentProduct(
                    currentProduct
                      ? { ...currentProduct, description: e.target.value }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{currentProduct?.name}"? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Dialogs */}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClientDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditClient}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default AdminPage;
