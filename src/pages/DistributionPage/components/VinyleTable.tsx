import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Edit,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { firstImage, formatList, getStockBadgeClass } from "../utils";
import type { PriceSort, VinyleRecord } from "../types";

/**
 * Tableau principal listant les vinyles disponibles. Purement présentationnel :
 * toute la logique (tri, panier, edit/delete) est déléguée au parent.
 */
export const VinyleTable = ({
  records,
  isAdmin,
  priceSort,
  onTogglePriceSort,
  resolveArtistes,
  getQty,
  onQtyChange,
  onAddToCart,
  onEdit,
  onDelete,
}: {
  records: VinyleRecord[];
  isAdmin: boolean;
  priceSort: PriceSort;
  onTogglePriceSort: () => void;
  resolveArtistes: (v: any) => string;
  getQty: (id: string) => number;
  onQtyChange: (id: string, delta: number, max: number) => void;
  onAddToCart: (r: VinyleRecord) => void;
  onEdit: (r: VinyleRecord) => void;
  onDelete: (r: VinyleRecord) => void;
}) => {
  return (
    <div className="overflow-x-auto">
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Ref</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Artistes</TableHead>
            <TableHead>Styles</TableHead>
            <TableHead>Label</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={onTogglePriceSort}
                className="inline-flex items-center gap-1 hover:text-foreground"
                title="Trier par prix distributeur"
              >
                Prix dist.
                {priceSort === "asc" && <ChevronUp className="h-3 w-3" />}
                {priceSort === "desc" && <ChevronDown className="h-3 w-3" />}
                {priceSort === "none" && (
                  <ChevronsUpDown className="h-3 w-3 opacity-50" />
                )}
              </button>
            </TableHead>
            <TableHead className="text-center">Acheter</TableHead>
            <TableHead className="text-center">Discogs</TableHead>
            {isAdmin && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isAdmin ? 11 : 10}
                className="text-center py-6 text-muted-foreground"
              >
                Aucun vinyle trouvé
              </TableCell>
            </TableRow>
          ) : (
            records.map((r) => {
              const img = firstImage(r.fields.Image);
              const stock = Number(r.fields.Quantité_Stock ?? 0);
              const price = Number(r.fields.Prix_distributeur ?? 0);
              const disabled = stock <= 0 || !(price > 0);
              const q = getQty(r.id);
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    {img ? (
                      <img
                        src={img}
                        alt={r.fields.Titre || "Vinyle"}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.fields.Ref}
                  </TableCell>
                  <TableCell className="text-l font-bold">
                    {r.fields.Titre}
                  </TableCell>
                  <TableCell>
                    {resolveArtistes(r.fields.Artistes) || "—"}
                  </TableCell>
                  <TableCell>{formatList(r.fields.Styles)}</TableCell>
                  <TableCell>{r.fields.Label}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={getStockBadgeClass(stock)}>
                      {r.fields.Quantité_Stock ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-l font-bold">
                    {r.fields.Prix_distributeur != null
                      ? `${r.fields.Prix_distributeur} €`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onQtyChange(r.id, -1, stock)}
                        disabled={disabled || q <= 1}
                        aria-label="Diminuer"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-sm tabular-nums">{q}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onQtyChange(r.id, +1, stock)}
                        disabled={disabled || q >= stock}
                        aria-label="Augmenter"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="ml-1"
                        onClick={() => onAddToCart(r)}
                        disabled={disabled}
                        title={
                          stock <= 0 ? "Rupture de stock" : "Ajouter au panier"
                        }
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-tekno-orange hover:bg-tekno-orange/90"
                      onClick={() =>
                        window.open(r.fields.Discogs_url, "_blank")
                      }
                    >
                      Discogs
                    </Button>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(r)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(r)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};