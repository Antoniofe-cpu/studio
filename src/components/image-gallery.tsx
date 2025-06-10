
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

  if (!mainImageUrl) {
    return (
      <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
        <TagIcon className="h-24 w-24" />
         <span className="ml-4 text-xl">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg bg-muted/30">
        <Image
          src={mainImageUrl}
          alt={altText}
          fill
          className="object-contain" 
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          key={mainImageUrl} 
          data-ai-hint="luxury watch photo"
        />
      </div>

      {imageUrls.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-2">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setMainImageUrl(url)}
              className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary
                ${url === mainImageUrl ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-muted-foreground/50'}`}
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
