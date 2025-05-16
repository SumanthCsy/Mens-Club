// @/components/home/featured-product-hero-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturedProductHeroCardProps {
  product: Product;
}

export function FeaturedProductHeroCard({ product }: FeaturedProductHeroCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className={cn(
        "relative aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/60",
        "flex flex-col justify-end items-start" // Aligns content to bottom-left
      )}>
        {/* Background Image */}
        <Image
          src={product.imageUrl || 'https://placehold.co/800x600.png'}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={product.dataAiHint || "fashion product"}
          priority={false} 
        />
        
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

        {/* Content Overlay */}
        <div className="relative z-10 p-4 xxs:p-5 xs:p-6 text-white w-full">
          <h3 className="text-lg xxs:text-xl xs:text-2xl sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 leading-tight group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-xs xxs:text-sm text-neutral-200 mb-2 sm:mb-3 line-clamp-2">
            {/* Display a short description or a call to action phrase */}
            {product.category || "Discover the Latest"}
          </p>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs xxs:text-sm py-1.5 px-3 sm:py-2 sm:px-4 group-hover:scale-105 transition-transform"
            asChild
          >
            <span className="inline-flex items-center"> {/* Use span for asChild */}
              Shop Now <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
            </span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
