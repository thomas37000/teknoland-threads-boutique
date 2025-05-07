
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductImagesProps {
  currentImage: string;
  setCurrentImage: (image: string) => void;
  images: string[];
}

const ProductImages = ({ currentImage, setCurrentImage, images }: ProductImagesProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (image: string) => {
    setCurrentImage(image);
    // Reset zoom when changing image
    setIsZoomed(false);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => prev + 0.5);
      if (!isZoomed) setIsZoomed(true);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => Math.max(1, prev - 0.5));
      if (zoomLevel <= 1.5) setIsZoomed(false);
    } else {
      setIsZoomed(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <>
      {/* Main Image with Zoom */}
      <div
        className="rounded-lg overflow-hidden bg-gray-100 relative"
        ref={imageRef}
        onMouseMove={handleMouseMove}
        style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
        onClick={() => isZoomed ? setIsZoomed(false) : handleZoomIn()}
      >
        <div
          className={`transition-transform duration-200 h-full w-full`}
          style={{
            transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
            transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center center'
          }}
        >
          <img
            src={currentImage}
            alt="Product"
            className="w-full h-auto object-cover aspect-square"
          />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image Gallery Tabs */}
      <div className="mt-4">
        {images.length > 1 ? (
          <ScrollArea className="whitespace-nowrap pb-4">
            <div className="flex gap-2">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer transition-all ${
                    currentImage === img ? 'ring-2 ring-tekno-blue' : 'ring-1 ring-gray-200'
                  }`}
                  onClick={() => handleImageClick(img)}
                >
                  <img
                    src={img}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default ProductImages;
