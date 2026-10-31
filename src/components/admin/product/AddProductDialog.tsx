import { useState } from "react";
import { Button } from "@/components/ui/button";
import PopupAdmin from "../PopupAdmin";
import StorageImagePicker from "./StorageImagePicker";
import { BasicProductFields, StockField, TextField, STREAMING_PLACEHOLDER } from "./form/BasicProductFields";
import { MainImageField, AdditionalImagesField } from "./form/ImageFields";
import { VariationsEditor } from "./form/VariationsEditor";
import { VinylTracksEditor } from "./form/VinylTracksEditor";

export function AddProductDialog({
  isOpen,
  onClose,
  onConfirm,
  newProduct,
  setNewProduct,
  variations,
  showVariations,
  addVariation,
  removeVariation,
  updateVariation,
  showVinylTracks,
  vinylTracks,
  updateVinylTrack,
  handleVinylAudioUpload,
  multipleImageFiles = [],
  imageFile,
  handleImageChange,
  handleMultipleImageChange,
  removeImage,
  showSimpleStock,
  CATEGORIES,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
}: any) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"main" | "additional">("main");
  const patch = (p: Record<string, any>) => setNewProduct({ ...newProduct, ...p });
  const openPicker = (mode: "main" | "additional") => { setPickerMode(mode); setPickerOpen(true); };

  const imageOptions = [
    ...(imageFile ? [{ value: URL.createObjectURL(imageFile), label: "Image principale" }] : []),
    ...multipleImageFiles.map((f: File, i: number) => ({ value: URL.createObjectURL(f), label: `Image ${i + 1}` })),
  ];
  const mainPreview =
    typeof newProduct?.image === "string" && newProduct.image.startsWith("http") ? newProduct.image : null;

  return (
    <PopupAdmin isOpen={isOpen} onClose={onClose} title="Ajoutez un nouveau produit" maxWidth="max-w-2xl">
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
        <BasicProductFields product={newProduct} onChange={patch} categories={CATEGORIES} nameHint />

        <MainImageField
          id="image"
          preview={mainPreview}
          onFileChange={(e) => handleImageChange(e, false)}
          onOpenStorage={() => openPicker("main")}
        />
        <AdditionalImagesField
          id="additional-images"
          files={multipleImageFiles}
          onFileChange={(e) => handleMultipleImageChange(e, false)}
          onRemoveFile={(i) => removeImage(i, false)}
          onOpenStorage={() => openPicker("additional")}
          hint="Upload up to 4 additional images. JPG, PNG, or WebP. Max 10MB each."
        />

        {showVariations && (
          <VariationsEditor
            variations={variations}
            imageOptions={imageOptions}
            colorOptions={COLOR_OPTIONS}
            sizeOptions={SIZE_OPTIONS}
            onAdd={() => addVariation()}
            onRemove={(i) => removeVariation(i)}
            onUpdate={(i, f, v) => updateVariation(i, f, v)}
          />
        )}

        {showVinylTracks && (
          <>
            <StockField id="vinyl-stock" value={newProduct.stock} onChange={(stock) => patch({ stock })} />
            <TextField
              id="streaming-url"
              label="Lien Streaming"
              type="url"
              value={newProduct.streamingUrl}
              onChange={(streamingUrl) => patch({ streamingUrl })}
              placeholder={STREAMING_PLACEHOLDER}
            />
            <VinylTracksEditor
              tracks={vinylTracks}
              onUpdate={(i, f, v) => updateVinylTrack(i, f, v)}
              onAudioUpload={(i, file) => handleVinylAudioUpload?.(i, file, false)}
            />
          </>
        )}

        {showSimpleStock && (
          <StockField id="stock" value={newProduct.stock} onChange={(stock) => patch({ stock })} />
        )}

        <TextField
          id="description"
          label="Description"
          value={newProduct?.description}
          onChange={(description) => patch({ description })}
        />
      </div>
      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={onClose} className="flex-1">Annulez</Button>
        <Button onClick={onConfirm} className="flex-1">Ajoutez</Button>
      </div>
      <StorageImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url: string) => pickerMode === "main" && patch({ image: url })}
        multiple={pickerMode === "additional"}
        onSelectMultiple={(urls: string[]) => patch({ images: urls })}
      />
    </PopupAdmin>
  );
}
