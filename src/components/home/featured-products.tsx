// @/components/home/featured-products.tsx
"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/products/product-card';
import type { Product } from '@/types';
import { collection, query, orderBy, limit, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Loader2, AlertTriangle } from 'lucide-react';

export function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const productsCol = collection(db, "products");
    const q = query(productsCol, orderBy("name"), limit(12));

    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setFeatured(productList);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching featured products with onSnapshot:", err);
      setError("Failed to load featured products in real-time.");
      setIsLoading(false);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-lg text-muted-foreground">Loading featured products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-lg text-destructive">{error}</p>
        </div>
      </section>
    );
  }

  if (featured.length === 0 && !isLoading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-muted-foreground">
            No featured products available at the moment. Add products to see them here!
          </p>
        </div>
      </section>
    );
  }

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
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
