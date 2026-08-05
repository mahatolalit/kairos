import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ImageViewer({ imageUrl, onClose }) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
      >
        <X className="size-6" />
      </button>

      <div 
        className={`relative max-w-full max-h-full overflow-auto flex items-center justify-center p-4 sm:p-8 transition-transform duration-300 ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(!isZoomed);
        }}
      >
        <img 
          src={imageUrl} 
          alt="Full screen view" 
          className={`object-contain transition-transform duration-300 ease-out origin-center ${
            isZoomed ? "scale-150 sm:scale-[2]" : "scale-100 max-h-[90vh]"
          }`}
        />
      </div>
    </div>
  );
}
