import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PopupAdmin from "../PopupAdmin";
import StorageImagePicker from "./StorageImagePicker";
import { BasicProductFields, StockField, TextField, STREAMING_PLACEHOLDER } from "./form/BasicProductFields";
import { MainImageField, AdditionalImagesField } from "./form/ImageFields";
import { VariationsEditor } from "./form/VariationsEditor";
import { VinylTracksEditor } from "./form/VinylTracksEditor";

const NO_VARIATION_CATEGORIES = ["Vinyles", "Double Vinyles", "Stickers"];
const VINYL_CATEGORIES = ["Vinyles", "Double Vinyles"];

export function EditProductDialog({
  isOpen,
  onClose,
  onConfirm,
  currentProduct,
  setCurrentProduct,
  addVariation,
  editVariations = [],
  removeVariation,
  updateVariation,
  editVinylTracks = [],
  updateVinylTrack,
  handleVinylAudioUpload,
  editImageFile,
  handleImageChange,
  editMultipleImageFiles = [],
  handleMultipleImageChange,
  removeImage,
  CATEGORIES,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
}: any) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"main" | "additional">("main");

  const patch = (p: Record<string, any>) => currentProduct && setCurrentProduct({ ...currentProduct, ...p });
  const openPicker = (mode: "main" | "additional") => { setPickerMode(mode); setPickerOpen(true); };
  const category = currentProduct?.category;
  const sizeStocks = (currentProduct?.size_stocks as any) || {};

  const imageOptions = [
    ...(currentProduct?.image ? [{ value: currentProduct.image, label: "Image principale" }] : []),
    ...(editImageFile ? [{ value: URL.createObjectURL(editImageFile), label: "Nouvelle image principale" }] : []),
    ...(currentProduct?.images || []).map((img: string, i: number) => ({ value: img, label: `Image ${i + 1}` })),
    ...editMultipleImageFiles.map((f: File, i: number) => ({ value: URL.createObjectURL(f), label: `Nouvelle image ${i + 1}` })),
  ];

  return (
    <>
      <PopupAdmin isOpen={isOpen} onClose={onClose} title="Modifiez un produit" maxWidth="max-w-2xl">
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <BasicProductFields product={currentProduct} onChange={patch} categories={CATEGORIES} idPrefix="edit-" />

          <MainImageField
            id="edit-image"
            preview={currentProduct?.image}
            onPreviewClick={setPreviewImage}
            onFileChange={(e) => handleImageChange(e, true)}
            onOpenStorage={() => openPicker("main")}
            showCompressHint
          />
          <AdditionalImagesField
            id="edit-additional-images"
            existing={currentProduct?.images || []}
            files={editMultipleImageFiles}
            onPreviewClick={setPreviewImage}
            onFileChange={(e) => handleMultipleImageChange(e, true)}
            onRemoveFile={(i) => removeImage(i, true)}
            onOpenStorage={() => openPicker("additional")}
            hint="Upload up to 4 new additional images. Will replace existing images. JPG, PNG, or WebP. Max 10MB each."
          />

          {currentProduct && !NO_VARIATION_CATEGORIES.includes(category) && (
            <VariationsEditor
              variations={editVariations}
              imageOptions={imageOptions}
              colorOptions={COLOR_OPTIONS}
              sizeOptions={SIZE_OPTIONS}
              onAdd={() => addVariation(true)}
              onRemove={(i) => removeVariation(i, true)}
              onUpdate={(i, f, v) => updateVariation(i, f, v, true)}
            />
          )}

          {currentProduct && VINYL_CATEGORIES.includes(category) && (
            <>
              <StockField id="edit-stock" value={currentProduct.stock} onChange={(stock) => patch({ stock })} />
              <VinylTracksEditor
                tracks={editVinylTracks}
                onUpdate={(i, f, v) => updateVinylTrack(i, f, v, true)}
                onAudioUpload={(i, file) => handleVinylAudioUpload?.(i, file, true)}
              />
              <TextField
                id="edit-streaming-url"
                label="Lien Streaming"
                type="url"
                value={sizeStocks.streamingUrl}
                onChange={(streamingUrl) => patch({ size_stocks: { ...sizeStocks, streamingUrl } })}
                placeholder={STREAMING_PLACEHOLDER}
              />
            </>
          )}

          {currentProduct && category === "Stickers" && (
            <StockField id="edit-stock" value={currentProduct.stock} onChange={(stock) => patch({ stock })} />
          )}

          <TextField
            id="edit-description"
            label="Description"
            value={currentProduct?.description}
            onChange={(description) => patch({ description })}
          />
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">Annulez</Button>
            <Button onClick={onConfirm} className="flex-1">Sauvegardez</Button>
          </div>
        </div>
      </PopupAdmin>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {previewImage && (
            <img src={previewImage} alt="Aperçu" className="w-full h-auto object-contain max-h-[80vh] rounded" />
          )}
        </DialogContent>
      </Dialog>
      <StorageImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url: string) => pickerMode === "main" && patch({ image: url })}
        multiple={pickerMode === "additional"}
        onSelectMultiple={(urls: string[]) => patch({ images: urls })}
      />
    </>
  );
}
