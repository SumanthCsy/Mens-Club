// @/components/products/product-image-gallery.tsx
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  altText: string;
  mainImageHint?: string;
  thumbnailHint?: string;
}

export function ProductImageGallery({ images, altText, mainImageHint = "product image", thumbnailHint = "product thumbnail" }: ProductImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(images[0] || 'https://placehold.co/600x800.png');

  if (!images || images.length === 0) {
    images = ['https://placehold.co/600x800.png'];
    setCurrentImage(images[0]);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-border/60 shadow-md bg-card">
        <Image
          src={currentImage}
          alt={altText}
          width={800}
          height={1066}
          className="object-cover w-full h-full transition-opacity duration-300 ease-in-out"
          priority // Prioritize loading of the main product image
          data-ai-hint={mainImageHint}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-3">
          {images.map((imgSrc, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(imgSrc)}
              className={cn(
                "aspect-square w-full overflow-hidden rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                currentImage === imgSrc ? 'border-primary shadow-lg' : 'border-border/50 hover:border-primary/70'
              )}
            >
              <Image
                src={imgSrc}
                alt={`${altText} - Thumbnail ${index + 1}`}
                width={150}
                height={150}
                className="object-cover w-full h-full"
                data-ai-hint={thumbnailHint}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
