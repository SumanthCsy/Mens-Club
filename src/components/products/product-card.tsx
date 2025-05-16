
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
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={800}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint || "fashion clothing"}
            />
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge variant="destructive" className="absolute top-3 right-3">
              SALE
            </Badge>
          )}
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-lg font-semibold leading-tight hover:text-primary transition-colors mb-1 truncate">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">{product.brand || product.category}</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
          {product.averageRating && typeof product.reviewCount === 'number' && product.reviewCount > 0 ? (
             <div className="flex items-center gap-1">
              <RatingStars rating={product.averageRating} size={14} />
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          ): null}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        <Button asChild variant="outline" className="flex-1 group/button">
          <Link href={`/products/${product.id}`}>
            <Eye className="mr-2 h-4 w-4 group-hover/button:animate-pulse" /> View
          </Link>
        </Button>
        <Button className="flex-1 group/button" variant="default">
          <ShoppingCart className="mr-2 h-4 w-4 group-hover/button:animate-bounce" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
