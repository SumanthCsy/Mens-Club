
// @/components/products/product-filters.tsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListFilter, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Assuming Input component exists
import { Button } from '@/components/ui/button'; // Assuming Button component exists

interface ProductFiltersProps {
  categories: string[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || "All Categories";
  const currentSortBy = searchParams.get('sortBy') || "featured";
  const currentSearchQuery = searchParams.get('q') || "";


  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All Categories") {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    router.push(`/products?${params.toString()}`);
  };
  
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    router.push(`/products?${params.toString()}`);
  };


  return (
    <div className="mb-8 p-4 sm:p-6 bg-card rounded-lg shadow-sm border border-border/60">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
        <form onSubmit={handleSearch} className="relative md:col-span-1">
          <Input
            type="search"
            name="search"
            defaultValue={currentSearchQuery}
            placeholder="Search products..."
            className="pl-10 h-11 text-base"
            aria-label="Search products"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Button type="submit" className="sr-only">Search</Button>
        </form>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select value={currentCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-11 text-base">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentSortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="h-11 text-base">
              <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              {/* <SelectItem value="rating">Average Rating</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
