
'use client'; 

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TagIcon } from 'lucide-react';

interface ImageGalleryProps {
  imageUrls: string[];
  altText?: string;
}

export function ImageGallery({ imageUrls, altText = "Watch image" }: ImageGalleryProps) {
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrls && imageUrls.length > 0) {
      setMainImageUrl(imageUrls[0]);
    } else {
      setMainImageUrl(null);
    }
  }, [imageUrls]);

  if (!mainImageUrl && (!imageUrls || imageUrls.length === 0)) {
    return (
      <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
        <TagIcon className="h-24 w-24" />
         <span className="ml-4 text-xl">No Image Available</span>
      </div>
    );
  }
  
  // Fallback if mainImageUrl is somehow null but imageUrls exist
  const currentMainImage = mainImageUrl || (imageUrls && imageUrls.length > 0 ? imageUrls[0] : 'https://placehold.co/600x450.png');


  return (
    <div className="space-y-3">
      {/* Immagine Principale Grande - Sezione Modificata */}
      <div className="relative w-full h-0 pb-[100%] rounded-lg overflow-hidden shadow-lg mb-4 bg-muted/30">
        {/* 
          Spiegazione della modifica:
          - `h-0` imposta l'altezza a zero.
          - `pb-[100%]` (padding-bottom: 100%) è un "trucco" CSS per creare un contenitore
            quadrato che si adatta alla larghezza. L'altezza (data dal padding)
            sarà sempre il 100% della larghezza del contenitore.
            Questo è un metodo più robusto di 'aspect-square'.
        */}
        <Image
          src={currentMainImage}
          alt={altText}
          fill
          className="absolute top-0 left-0 w-full h-full object-contain" 
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          key={currentMainImage} 
          data-ai-hint="luxury watch photo"
        />
      </div>

      {imageUrls && imageUrls.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-2">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setMainImageUrl(url)}
              className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary
                ${url === currentMainImage ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-muted-foreground/50'}`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={url}
                alt={`Watch thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="20vw"
                data-ai-hint="watch thumbnail"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

