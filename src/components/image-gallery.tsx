
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, TagIcon, AlertTriangleIcon } from 'lucide-react'; // Added AlertTriangleIcon

interface ImageGalleryProps {
  imageUrls?: string[]; 
  imageUrl?: string | null; 
  altText?: string; 
}

export function ImageGallery({ imageUrls, imageUrl, altText = "Watch image" }: ImageGalleryProps) {
  const allImages = useMemo(() => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls.filter(url => typeof url === 'string' && url.trim() !== '');
    }
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      return [imageUrl.trim()];
    }
    return [];
  }, [imageUrls, imageUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);

  const currentMainImageSrc = allImages.length > 0 ? allImages[currentIndex] : null;

  useEffect(() => {
    setMainImageError(false); // Reset error when current image src changes
  }, [currentMainImageSrc]);

  useEffect(() => { // Reset current index if allImages changes and currentIndex is out of bounds
    if (allImages.length > 0 && currentIndex >= allImages.length) {
      setCurrentIndex(0);
    } else if (allImages.length === 0) {
      setCurrentIndex(0); // Or handle as no images
    }
  }, [allImages, currentIndex]);


  if (allImages.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground shadow-inner p-4 text-center">
        <TagIcon className="h-16 w-16 mb-2" />
        <span className="text-lg">No Image Available</span>
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
  
  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg group bg-muted/30">
        {currentMainImageSrc && !mainImageError ? (
          <Image
            key={currentMainImageSrc} // Important for re-triggering load/error on src change
            src={currentMainImageSrc}
            alt={altText || "Main watch display"}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority={currentIndex === 0} // Prioritize first image
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 50vw"
            data-ai-hint="luxury watch photo"
            onError={() => {
              console.error(`Failed to load main image in gallery: ${currentMainImageSrc}`);
              setMainImageError(true);
            }}
          />
        ) : (
          <div className="aspect-square w-full rounded-lg bg-muted flex flex-col items-center justify-center text-destructive shadow-inner p-4 text-center">
            <AlertTriangleIcon className="h-16 w-16 mb-2" /> {/* Icon for error */}
            <span className="text-lg">Image Failed to Load</span>
            {currentMainImageSrc && <span className="text-xs text-muted-foreground truncate max-w-full px-2">URL: {currentMainImageSrc}</span>}
          </div>
        )}

        {allImages.length > 1 && (
          <>
            <button
              onClick={goToPrevImage}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
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

      {allImages.length > 1 && (
        <div className="mx-auto w-full max-w-xl">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {allImages.map((url, index) => (
              <button
                key={index + '-' + url} // More unique key for thumbnails
                onClick={() => setCurrentIndex(index)}
                className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/70
                  ${index === currentIndex && !mainImageError ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-muted-foreground/50'}`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={url}
                  alt={`${altText || 'Watch thumbnail'} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px" 
                  data-ai-hint="watch thumbnail"
                  loading="lazy"
                  onError={(e) => {
                    console.warn(`Failed to load thumbnail: ${url}`);
                    // Optionally, replace the image source with a placeholder for this specific thumbnail
                    // e.target.src = '/path/to/thumbnail-placeholder.png'; // Requires placeholder image
                    (e.target as HTMLImageElement).style.display = 'none'; // Hide broken image
                    // Or render a fallback UI component within the button if image fails
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
