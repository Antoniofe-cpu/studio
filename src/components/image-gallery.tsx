'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, TagIcon } from 'lucide-react';

interface ImageGalleryProps {
  imageUrls?: string[]; // Array of all image URLs for the gallery
  imageUrl?: string | null; // Primary image, used if imageUrls is not sufficient
  altText?: string; // Base alt text, will be suffixed for main/thumbnails
}

export function ImageGallery({ imageUrls, imageUrl, altText = "Watch image" }: ImageGalleryProps) {
  // Consolidate all available images. Prefer imageUrls if provided and non-empty.
  // Otherwise, use imageUrl if it exists. Fallback to an empty array.
  const allImages = useMemo(() => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls;
    }
    if (imageUrl) {
      return [imageUrl];
    }
    return [];
  }, [imageUrls, imageUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
        <TagIcon className="h-24 w-24" />
        <span className="ml-4 text-xl">No Image Available</span>
      </div>
    );
  }

  const goToPrevImage = () => {
    const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNextImage = () => {
    const newIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const currentMainImageSrc = allImages[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Immagine Principale con Frecce Sovrapposte */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg group bg-muted/30">
        <Image
          src={currentMainImageSrc}
          alt={altText || "Main watch display"}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 50vw"
          key={currentMainImageSrc} // Key helps ensure re-render on src change if needed
          data-ai-hint="luxury watch photo"
        />

        {/* Pulsanti di Navigazione (visibili solo se c'è più di un'immagine) */}
        {allImages.length > 1 && (
          <>
            {/* Freccia Sinistra */}
            <button
              onClick={goToPrevImage}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
            {/* Freccia Destra */}
            <button
              onClick={goToNextImage}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {/* Galleria di Miniature Ridimensionate */}
      {allImages.length > 1 && (
        <div className="mx-auto w-full max-w-xl">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {allImages.map((url, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/70
                  ${index === currentIndex ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-muted-foreground/50'}`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={url}
                  alt={`${altText || 'Watch thumbnail'} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="20vw"
                  data-ai-hint="watch thumbnail"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
