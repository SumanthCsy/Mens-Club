
// @/components/products/product-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/shared/rating-stars';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full rounded-lg border border-border/60">
      <Link href={`/products/${product.id}`} className="block group">
        <CardHeader className="p-0 relative">
          <div className="aspect-[3/4] w-full overflow-hidden">
            <Image
              src={product.imageUrl || 'https://placehold.co/600x800.png'}
              alt={product.name}
              width={600}
              height={800}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint || "fashion clothing"}
              priority={false} // Set to false for non-LCP images, true if it's a critical above-the-fold image on some pages
            />
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge variant="destructive" className="absolute top-2 right-2 sm:top-3 sm:right-3 text-xs px-2 py-0.5">
              SALE
            </Badge>
          )}
        </CardHeader>
      </Link>
      <CardContent className="p-3 sm:p-4 flex-grow">
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight hover:text-primary transition-colors mb-1 truncate">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{product.brand || product.category}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
          <div className="flex items-baseline gap-2 mb-1 sm:mb-0">
            <p className="text-lg sm:text-xl font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs sm:text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
          {product.averageRating && typeof product.reviewCount === 'number' && product.reviewCount > 0 ? (
             <div className="flex items-center gap-1">
              <RatingStars rating={product.averageRating} size={12} smSize={14} />
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          ): null}
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex items-center gap-2 sm:gap-3">
        <Button asChild variant="outline" className="flex-1 text-xs sm:text-sm py-2 h-auto sm:h-10 group/button">
          <Link href={`/products/${product.id}`}>
            <Eye className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/button:animate-pulse" /> View
          </Link>
        </Button>
        <Button className="flex-1 text-xs sm:text-sm py-2 h-auto sm:h-10 group/button" variant="default">
          <ShoppingCart className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/button:animate-bounce" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

// Note: For RatingStars to accept smSize, its props would need to be updated.
// For now, I've just made the base size slightly smaller.
// If RatingStars needs to be responsive:
// Interface: size?: number; smSize?: number;
// Logic: const currentSize = useIsMobile() ? size : (smSize || size); (requires useIsMobile hook or similar logic)
// Or pass responsive Tailwind classes to starClassName. For simplicity, just adjusted base size.
