import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { Product } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdminProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  calculateTotalStock: (product: Product) => number;
  showSeller?: boolean;
  sellers?: any[];
}

export const AdminProductTable = ({
  products,
  isLoading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  calculateTotalStock,
  showSeller = true,
  sellers = []
}: AdminProductTableProps) => {
  const { user } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">Chargement des produits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>
          {products.length === 0 ? "Aucun produit trouvé" : `${products.length} produit(s) trouvé(s)`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Catégorie</TableHead>
            {showSeller && <TableHead>Vendeur</TableHead>}
            <TableHead>Stock</TableHead>
            <TableHead>Date de crétion</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showSeller ? 8 : 7} className="text-center py-10">
                Aucun produit trouvé
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const seller = sellers.find(s => s.id === product.seller_id);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs max-w-[100px] truncate">
                    {product.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.price}€</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category}
                    </Badge>
                  </TableCell>
                  {showSeller && (
                    <TableCell>
                      <Badge variant="secondary">
                        {seller?.full_name || seller?.email || 'Admin'}
                      </Badge>
                    </TableCell>
                  )}

                  {/* Colonne Stock */}
                  <TableCell>
                    <Badge
                      variant={calculateTotalStock(product) > 0 ? "default" : "destructive"}
                    >
                      {calculateTotalStock(product)}
                    </Badge>
                  </TableCell>
                   {/* Colonne Date de création */}
                   <TableCell className="font-medium">
                    {new Date(product.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>

                  {/* Colonne Actions */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/product/${product.slug}`}>
                          <Eye size={14} />
                        </Link>
                      </Button>
                      {(!product.seller_id || product.seller_id === user?.id) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(product)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
