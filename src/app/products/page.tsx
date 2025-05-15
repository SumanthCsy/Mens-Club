// @/app/products/page.tsx
import { ProductCard } from '@/components/products/product-card';
import { sampleProducts } from '@/lib/placeholder-data';
import { Filter, ListFilter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'All Products | Mens Club Keshavapatnam',
  description: 'Browse our full collection of premium men\'s fashion.',
};

export default function ProductsPage() {
  // In a real app, products would be fetched, possibly with pagination and filtering.
  const products = sampleProducts;

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Our Collection</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover meticulously crafted pieces designed for the modern man. Explore a wide range of apparel and accessories.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="mb-8 p-6 bg-card rounded-lg shadow-sm border border-border/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="relative md:col-span-1">
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 h-11 text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select>
              <SelectTrigger className="h-11 text-base">
                <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Average Rating</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-11 text-base w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>
      
      <Separator className="my-8" />

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">No products found.</p>
        </div>
      )}

      {/* Pagination (Placeholder) */}
      <div className="mt-12 flex justify-center">
        <div className="flex gap-2">
          <Button variant="outline" disabled>Previous</Button>
          <Button variant="outline">1</Button>
          <Button variant="outline" disabled>2</Button>
          <Button variant="outline" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}
