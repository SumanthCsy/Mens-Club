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
    <Link href={`/products/${product.id}`} className="block group h-full">
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full rounded-lg border border-border/60">
        <CardHeader className="p-0 relative">
          <div className="aspect-[3/4] w-full overflow-hidden">
            <Image
              src={product.imageUrl || 'https://placehold.co/600x800.png'}
              alt={product.name}
              width={600}
              height={800}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint || "fashion clothing"}
              priority={false}
            />
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge variant="destructive" className="absolute top-2 right-2 text-xs px-2 py-0.5">
              SALE
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-3 xxs:p-3 xs:p-4 sm:p-4 flex-grow">
          <CardTitle className="text-sm xxs:text-base sm:text-lg font-semibold leading-tight group-hover:text-primary transition-colors mb-1 truncate">
            {product.name}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{product.brand || product.category}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <div className="flex items-baseline gap-1 xxs:gap-2 mb-1 sm:mb-0">
              <p className="text-base xxs:text-lg sm:text-xl font-bold text-primary">
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
        <CardFooter className="p-3 xxs:p-3 xs:p-4 sm:p-4 pt-0 flex flex-col sm:flex-row items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="w-full text-xs py-2 px-3 h-auto group/button sm:h-9 sm:text-sm sm:flex-1 sm:w-auto"
            onClick={(e) => {
              // Prevent link navigation if button specific action is needed in future
              // For now, it's part of the larger card link
            }}
          >
            {/* Link wrapper removed, button itself will be part of the card link */}
            <>
              <Eye className="mr-1.5 h-4 w-4 sm:mr-2 group-hover/button:animate-pulse" /> View
            </>
          </Button>
          <Button
            className="w-full text-xs py-2 px-3 h-auto group/button sm:h-9 sm:text-sm sm:flex-1 sm:w-auto"
            variant="default"
            onClick={(e) => {
              e.preventDefault(); // Prevent the Link navigation
              e.stopPropagation(); // Stop event from bubbling to the Link
              // Add actual "Add to Cart" logic here using context or other state management
              console.log("Add to cart clicked for:", product.name);
              // Example: cart.addItem(product);
              // For now, it just logs to console to prevent link navigation
            }}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4 sm:mr-2 group-hover/button:animate-bounce" /> Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
