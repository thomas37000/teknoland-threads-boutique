import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import PopupAdmin from "../PopupAdmin";

export function EditProductDialog({
  isOpen,
  onClose,
  onConfirm,
  currentProduct,
  setCurrentProduct,
  variations,
  setVariations,
  addVariation,
  editVariations,
  removeVariation,
  updateVariation,
  vinylTracks,
  editVinylTracks,
  setVinylTracks,
  updateVinylTrack,
  multipleImageFiles,
  setMultipleImageFiles,
  imageFile,
  setImageFile,
  editImageFile,
  handleImageChange,
  handleEditWithImage,
  editMultipleImageFiles,
  handleMultipleImageChange,
  removeImage,
  CATEGORIES,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  setIsEditDialogOpen,
  mode, // "add" ou "edit"
}: any) {
  return (
    <PopupAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Modifiez un produit"
      maxWidth="max-w-2xl"
    >
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="edit-name" className="text-right">
            Nom
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
        {/* Category Dropdown */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="edit-category" className="text-right">
            Categorie
          </Label>
          <div className="col-span-3">
            <Select
              value={currentProduct?.category || ""}
              onValueChange={(value) =>
                setCurrentProduct(
                  currentProduct
                    ? { ...currentProduct, category: value }
                    : null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="edit-price" className="text-right">
            Prix
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

        {/* Main Image Upload */}
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="edit-image" className="text-right">
            Image principale
          </Label>
          <div className="col-span-3 space-y-2">
            {currentProduct?.image && (
              <div className="mb-2">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="h-20 w-auto object-contain rounded"
                />
              </div>
            )}
            <Input
              id="edit-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleImageChange(e, true)}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, or WebP. Max 10MB.
            </p>
            <div className="text-xs text-muted-foreground">
              Site pour comprésser vos fichiers si suppérier à 10MB: https://compresspng.com/fr/
            </div>
          </div>
        </div>

        {/* Additional Images Upload */}
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="edit-additional-images" className="text-right">
           Images supplémentaires (4 max)
          </Label>
          <div className="col-span-3">
            {/* Show existing additional images */}
            {currentProduct?.images && currentProduct.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {currentProduct.images.map((img, index) => (
                  <div key={index} className="relative border rounded p-2">
                    <img
                      src={img}
                      alt={`Image ${index}`}
                      className="h-20 w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            <Input
              id="edit-additional-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleMultipleImageChange(e, true)}
              className="col-span-3"
              disabled={editMultipleImageFiles.length >= 4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload up to 4 new additional images. Will replace existing images. JPG, PNG, or WebP. Max 10MB each.
            </p>

            {editMultipleImageFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {editMultipleImageFiles.map((file, index) => (
                  <div key={index} className="relative border rounded p-2">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-20 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, true)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VariationList.tsx */}
        {/* Product Variations */}
        {currentProduct && !["Vinyles", "Double Vinyles", "Stickers"].includes(currentProduct.category) && (
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Variations
            </Label>
            <div className="col-span-3 space-y-4">
              {editVariations.map((variation, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variation {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariation(index, true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-sm">Image</Label>
                      <div className="space-y-2">
                        <Select
                          value={variation.image || ''}
                          onValueChange={(value) => updateVariation(index, 'image', value, true)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir image" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentProduct?.image && (
                              <SelectItem value={currentProduct.image}>
                                Image principale
                              </SelectItem>
                            )}
                            {editImageFile && (
                              <SelectItem value={URL.createObjectURL(editImageFile)}>
                                Nouvelle image principale
                              </SelectItem>
                            )}
                            {currentProduct?.images?.map((img, imgIndex) => (
                              <SelectItem key={imgIndex} value={img}>
                                Image {imgIndex + 1}
                              </SelectItem>
                            ))}
                            {editMultipleImageFiles.map((file, imgIndex) => (
                              <SelectItem key={`new-${imgIndex}`} value={URL.createObjectURL(file)}>
                                Nouvelle image {imgIndex + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {variation.image && (
                          <img
                            src={variation.image}
                            alt={`Variation ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Couleur</Label>
                      <Select
                        value={variation.color}
                        onValueChange={(value) => updateVariation(index, 'color', value, true)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOR_OPTIONS.map(color => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Taille</Label>
                      <Select
                        value={variation.size}
                        onValueChange={(value) => updateVariation(index, 'size', value, true)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZE_OPTIONS.map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variation.stock}
                        onChange={(e) => updateVariation(index, 'stock', e.target.value, true)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => addVariation(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une variation
              </Button>

              {editVariations.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Stock total: {editVariations.reduce((sum, v) => sum + v.stock, 0)} unités
                </div>
              )}
            </div>
          </div>
        )}

        {/* VinylTracksEditor.tsx */}
        {/* Vinyl Tracks for Edit */}
        {currentProduct && ["Vinyles", "Double Vinyles"].includes(currentProduct.category) && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-stock" className="text-right">
                Stock
              </Label>
              <Input
                id="edit-stock"
                type="number"
                min="0"
                value={currentProduct.stock || ""}
                onChange={(e) =>
                  setCurrentProduct(
                    currentProduct
                      ? { ...currentProduct, stock: parseInt(e.target.value) || 0 }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Pistes
              </Label>
              <div className="col-span-3 space-y-4">
                {editVinylTracks.map((track, index) => (
                  <div key={track.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Piste {track.id}</h4>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-sm">Nom de la piste</Label>
                        <Input
                          value={track.name}
                          onChange={(e) => updateVinylTrack(index, 'name', e.target.value, true)}
                          placeholder="Titre de la chanson"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Durée (MM:SS)</Label>
                        <Input
                          value={track.duration}
                          onChange={(e) => updateVinylTrack(index, 'duration', e.target.value, true)}
                          placeholder="3:45"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Artiste</Label>
                        <Input
                          value={track.artist}
                          onChange={(e) => updateVinylTrack(index, 'artist', e.target.value, true)}
                          placeholder="Nom de l'artiste"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Année</Label>
                        <Input
                          value={track.year}
                          onChange={(e) => updateVinylTrack(index, 'year', e.target.value, true)}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Simple Stock for Stickers Edit */}
        {currentProduct && ["Stickers"].includes(currentProduct.category) && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-stock" className="text-right">
              Stock
            </Label>
            <Input
              id="edit-stock"
              type="number"
              min="0"
              value={currentProduct.stock || ""}
              onChange={(e) =>
                setCurrentProduct(
                  currentProduct
                    ? { ...currentProduct, stock: parseInt(e.target.value) || 0 }
                    : null
                )
              }
              className="col-span-3"
            />
          </div>
        )}

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
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annulez
          </Button>
          <Button onClick={onConfirm} className="flex-1">Sauvegardez</Button>
        </div>
      </div>
    </PopupAdmin>
  );
}