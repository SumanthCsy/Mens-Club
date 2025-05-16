// @/components/shared/rating-stars.tsx
"use client";

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  smSize?: number; // Optional size for sm screens and up
  className?: string;
  starClassName?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 16, // Default size for mobile
  smSize,    // Size for sm screens and up
  className,
  starClassName,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  // Determine current star size based on viewport (conceptual without direct JS for media query here)
  // This will be handled by responsive Tailwind classes passed via starClassName if needed,
  // or by adjusting 'size' prop directly in parent.
  // For this simple adjustment, ProductCard will pass a smaller 'size' for mobile.
  // The 'smSize' prop is more for a potential future enhancement where this component itself is responsive.
  const currentSize = size; 

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <Star
            key={`full-${i}`}
            fill="currentColor"
            className={cn("text-yellow-400", starClassName)}
            size={currentSize}
          />
        ))}
      {hasHalfStar && (
        <StarHalf
          key="half"
          fill="currentColor"
          className={cn("text-yellow-400", starClassName)}
          size={currentSize}
        />
      )}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn("text-muted-foreground/50", starClassName)}
            size={currentSize}
          />
        ))}
    </div>
  );
}
