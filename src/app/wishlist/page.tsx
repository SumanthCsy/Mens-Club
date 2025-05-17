
// @/app/wishlist/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useWishlist } from '@/context/wishlist-context';
import type { Product } from '@/types';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { HeartCrack, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistItems.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Firestore 'in' query can take up to 30 elements.
        // For larger wishlists, you might need to batch requests or fetch all and filter client-side.
        // For simplicity here, we'll assume wishlistItems.length is manageable.
        if (wishlistItems.length > 30) {
             console.warn("Wishlist too large for a single 'in' query. Fetching all and filtering.");
             const productsCol = collection(db, "products");
             const productSnapshot = await getDocs(productsCol);
             const allProducts = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
             const wishlistProducts = allProducts.filter(p => wishlistItems.includes(p.id));
             setProducts(wishlistProducts);
        } else {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('__name__', 'in', wishlistItems)); // __name__ refers to document ID
            const querySnapshot = await getDocs(q);
            const fetchedProducts = querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data(),
            } as Product));
            setProducts(fetchedProducts);
        }

      } catch (err) {
        console.error("Error fetching wishlist products:", err);
        setError("Failed to load wishlist items. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistItems]);

  const handleRemoveFromWishlistPage = (productId: string) => {
    removeFromWishlist(productId); // This will also update wishlistItems via context, triggering useEffect
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Your Wishlist</h1>
      </div>

      {isLoading && (
        <div className="text-center py-16">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-lg text-muted-foreground">Loading your wishlist...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-lg text-destructive">{error}</p>
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-16 bg-card border border-border/60 rounded-lg shadow-sm">
          <HeartCrack className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8">
            Start adding your favorite items to your wishlist.
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-5 w-5" /> Discover Products
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 z-10"
                onClick={() => handleRemoveFromWishlistPage(product.id)}
                title="Remove from wishlist"
              >
                <HeartCrack className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
