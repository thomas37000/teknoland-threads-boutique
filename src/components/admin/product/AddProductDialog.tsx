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
  multipleImageFiles,
  imageFile,
  handleImageChange,
  handleMultipleImageChange,
  removeImage,
  showSimpleStock,// Stckers
  CATEGORIES,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  mode, // "add" ou "edit"
}: any) {
  return (
    <PopupAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Ajoutez un nouveau produit"
      maxWidth="max-w-2xl"
    >
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nom
          </Label>
          <div className="col-span-3">
          <Input
            id="name"
            value={newProduct?.name || ""}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="col-span-3"
            placeholder="Le nom du produit doit être unique" 
          />
          <p className="text-xs text-muted-foreground mt-1">
              Si vous avez un tshirt et un sweat qui ont le même logo modifiez le nom, ex: tshirt Tekno Attacks et sweat Tekno Attacks au lieu de juste Tekno Attacks
          </p>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Categorie
          </Label>
          <div className="col-span-3">
            <Select
              value={newProduct?.category || ""}
              onValueChange={(value) =>
                setNewProduct({ ...newProduct, category: value })
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

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Prix
          </Label>
          <Input
            id="price"
            type="number"
            value={newProduct?.price || ""}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
            }
            className="col-span-3"
          />
        </div>

        {/* Main Image Upload */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="image" className="text-right">
            Image principale
          </Label>
          <div className="col-span-3">
            <Input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleImageChange(e, false)}
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, or WebP. Max 10MB.
            </p>
          </div>
        </div>

         {/* Additional Images Upload */}
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="additional-images" className="text-right">
            Images supplémentaires (4 max)
          </Label>
          <div className="col-span-3">
            <Input
              id="additional-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleMultipleImageChange(e, false)}
              className="col-span-3"
              disabled={multipleImageFiles?.length >= 4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload up to 4 additional images. JPG, PNG, or WebP. Max 10MB each.
            </p>

            {multipleImageFiles?.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {multipleImageFiles.map((file, index) => (
                  <div key={index} className="relative border rounded p-2">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-20 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, false)}
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
        
        {/* Variations Tshirts && Sweats */}
        {showVariations && (
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Variations
            </Label>
            <div className="col-span-3 space-y-4">
              {variations?.map((variation, index) => (
                <div key={index.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variation {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-sm">Image</Label>
                      <div className="space-y-2">
                        <Select
                          value={variation?.image || ''}
                          onValueChange={(value) => updateVariation(index, 'image', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir image" />
                          </SelectTrigger>
                          <SelectContent>
                            {imageFile && (
                              <SelectItem value={URL.createObjectURL(imageFile)}>
                                Image principale
                              </SelectItem>
                            )}
                            {multipleImageFiles.map((file, imgIndex) => (
                              <SelectItem key={imgIndex} value={URL.createObjectURL(file)}>
                                Image {imgIndex + 1}
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
                        onValueChange={(value) => updateVariation(index, 'color', value)}
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
                        onValueChange={(value) => updateVariation(index, 'size', value)}
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
                        onChange={(e) => updateVariation(index, 'stock', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => addVariation()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une variation
              </Button>

              {variations?.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Stock total: {variations.reduce((sum, v) => sum + v.stock, 0)} unités
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vinyl Tracks */}
        {showVinylTracks && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vinyl-stock" className="text-right">
                Stock
              </Label>
              <Input
                id="vinyl-stock"
                type="number"
                min="0"
                value={newProduct.stock || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })
                }
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="streaming-url" className="text-right">
                Lien Streaming
              </Label>
              <Input
                id="streaming-url"
                type="url"
                value={newProduct.streamingUrl || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, streamingUrl: e.target.value })
                }
                placeholder="https://soundcloud.com/... ou https://open.spotify.com/..."
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Pistes
              </Label>
            <div className="col-span-3 space-y-4">
              {vinylTracks.map((track, index) => (
                <div key={track.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Piste {track.id}</h4>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-sm">Nom de la piste</Label>
                      <Input
                        value={track.name}
                        onChange={(e) => updateVinylTrack(index, 'name', e.target.value)}
                        placeholder="Titre de la chanson"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Durée (MM:SS)</Label>
                      <Input
                        value={track.duration}
                        onChange={(e) => updateVinylTrack(index, 'duration', e.target.value)}
                        placeholder="3:45"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Artiste</Label>
                      <Input
                        value={track.artist}
                        onChange={(e) => updateVinylTrack(index, 'artist', e.target.value)}
                        placeholder="Nom de l'artiste"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Année</Label>
                      <Input
                        value={track.year}
                        onChange={(e) => updateVinylTrack(index, 'year', e.target.value)}
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

        {/* Stickers */}
        {showSimpleStock && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={newProduct.stock || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })
              }
              className="col-span-3"
            />
          </div>
        )}

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input
            id="description"
            value={newProduct?.description || ""}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            className="col-span-3"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Annulez
        </Button>
        <Button onClick={onConfirm} className="flex-1">Ajoutez</Button>
      </div>
    </PopupAdmin>
  );
}