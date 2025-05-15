// @/components/home/featured-products.tsx
import { ProductCard } from '@/components/products/product-card';
import { sampleProducts } from '@/lib/placeholder-data';
import type { Product } from '@/types';

export function FeaturedProducts() {
  // In a real app, you'd fetch featured products. Here we use sample data.
  const featured: Product[] = sampleProducts.slice(0, 4); // Show first 4 products as featured

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Featured Collection
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked essentials for the discerning gentleman. Explore our latest and most popular items.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
