// @/components/shared/rating-stars.tsx
"use client";

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
  starClassName?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  className,
  starClassName,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <Star
            key={`full-${i}`}
            fill="currentColor"
            className={cn("text-yellow-400", starClassName)}
            size={size}
          />
        ))}
      {hasHalfStar && (
        <StarHalf
          key="half"
          fill="currentColor"
          className={cn("text-yellow-400", starClassName)}
          size={size}
        />
      )}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn("text-muted-foreground/50", starClassName)}
            size={size}
          />
        ))}
    </div>
  );
}
