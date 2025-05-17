// @/components/products/product-image-gallery.tsx
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  altText: string;
  mainImageHint?: string;
  thumbnailHint?: string;
}

export function ProductImageGallery({ 
  images, 
  altText, 
  mainImageHint = "product image", 
  thumbnailHint = "product thumbnail" 
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle cases where images array might be empty or undefined
  const effectiveImages = images && images.length > 0 ? images : ['https://placehold.co/800x1000.png'];

  useEffect(() => {
    // Reset to first image if the images prop changes and new index is out of bounds
    if (currentIndex >= effectiveImages.length) {
      setCurrentIndex(0);
    }
  }, [effectiveImages, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? effectiveImages.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === effectiveImages.length - 1 ? 0 : prevIndex + 1));
  };

  if (effectiveImages.length === 0) {
    return (
        <div className="w-full overflow-hidden rounded-lg border border-border/60 shadow-md bg-card flex items-center justify-center aspect-square">
            <Image
                src={'https://placehold.co/600x600.png'}
                alt="Placeholder Image"
                width={600}
                height={600}
                className="object-contain w-full h-full"
                priority
                data-ai-hint="placeholder"
            />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image with Slider Controls */}
      <div className="relative w-full overflow-hidden rounded-lg border border-border/60 shadow-md bg-card">
        <div className="w-full h-auto"> {/* This div allows natural aspect ratio */}
          <Image
            src={effectiveImages[currentIndex]}
            alt={`${altText} - Image ${currentIndex + 1}`}
            width={800} // Provide a base width for optimization
            height={1000} // Provide a base height for optimization
            className="object-contain w-full h-full transition-opacity duration-300 ease-in-out"
            priority // Prioritize loading of the main product image
            data-ai-hint={mainImageHint}
          />
        </div>
        {effectiveImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 text-foreground rounded-full shadow-md h-10 w-10 sm:h-12 sm:w-12"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 text-foreground rounded-full shadow-md h-10 w-10 sm:h-12 sm:w-12"
              aria-label="Next Image"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {effectiveImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-3">
          {effectiveImages.map((imgSrc, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "aspect-square w-full overflow-hidden rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                currentIndex === index ? 'border-primary shadow-lg' : 'border-border/50 hover:border-primary/70'
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
