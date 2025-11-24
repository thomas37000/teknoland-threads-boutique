import { ProductField } from "./ProductField";

// ProductForm.tsx
export function ProductForm({
  product,
  setProduct,
  variations,
  setVariations,
  vinylTracks,
  setVinylTracks,
  multipleImageFiles,
  setMultipleImageFiles,
  imageFile,
  setImageFile,
  mode, // "add" ou "edit"
}: any) {
  return (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
      <ProductField
        id={`${mode}-name`}
        label="Name"
        value={product.name || ""}
        onChange={(val) => setProduct({ ...product, name: val })}
      />

      {/* Category Dropdown */}
      {/* ...extrait dans SelectCategory.tsx */}

      {/* Price */}
      <ProductField
        id={`${mode}-price`}
        label="Price"
        type="number"
        value={product.price || ""}
        onChange={(val) => setProduct({ ...product, price: val })}
      />

      {/* Sold Price */}
      <ProductField
        id={`${mode}-sold-price`}
        label="Sold Price (optional)"
        type="number"
        value={product.sold_price || ""}
        onChange={(val) => setProduct({ ...product, sold_price: val })}
      />

      {/* ImageUpload.tsx */}
      {/* VariationList.tsx */}
      {/* VinylTracksEditor.tsx */}
      {/* StockField.tsx */}

      <ProductField
        id={`${mode}-description`}
        label="Description"
        value={product.description || ""}
        onChange={(val) => setProduct({ ...product, description: val })}
      />
    </div>
  );
}