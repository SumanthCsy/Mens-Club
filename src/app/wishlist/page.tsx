
// @/app/wishlist/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useWishlist } from '@/context/wishlist-context';
import type { Product } from '@/types';
import { db, auth } from '@/lib/firebase'; // Import auth
import { collection, doc, getDoc, getDocs, query, where, documentId } from 'firebase/firestore'; // Import documentId
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { HeartCrack, Loader2, AlertTriangle, ArrowLeft, LogIn } from 'lucide-react'; // Added LogIn
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added useRouter
import type { User as FirebaseUser } from 'firebase/auth'; // Added FirebaseUser type

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoadingWishlist: isLoadingWishlistContext } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null); // Added currentUser state
  const router = useRouter(); // Added router

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (!user && !isLoadingWishlistContext) { // If not loading context and no user, stop product loading
        setIsLoadingProducts(false);
      }
    });
    return () => unsubscribeAuth();
  }, [isLoadingWishlistContext]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!currentUser) { // Don't fetch if no user
        setProducts([]);
        setIsLoadingProducts(false);
        return;
      }
      if (wishlistItems.length === 0) {
        setProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);
      setError(null);
      try {
        const productIdsToFetch = [...wishlistItems]; // Create a mutable copy
        const fetchedProducts: Product[] = [];

        // Firestore 'in' query can take up to 30 elements.
        // Batch requests if more than 30 product IDs.
        while (productIdsToFetch.length > 0) {
          const batch = productIdsToFetch.splice(0, 30); // Get next batch of 30
          if (batch.length > 0) {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where(documentId(), 'in', batch)); // Use documentId() for querying by ID
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(docSnap => {
              fetchedProducts.push({
                id: docSnap.id,
                ...docSnap.data(),
              } as Product);
            });
          }
        }
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
        setError("Failed to load wishlist items. Please try again.");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (!isLoadingWishlistContext && currentUser) { // Fetch only if context isn't loading and user exists
      fetchWishlistProducts();
    } else if (!currentUser) { // If no user, ensure products are cleared
      setProducts([]);
      setIsLoadingProducts(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistItems, currentUser, isLoadingWishlistContext]); // Depend on wishlistItems from context and currentUser

  const handleRemoveFromWishlistPage = async (productId: string) => {
    await removeFromWishlist(productId); // Context now handles Firestore update
  };

  if (isLoadingWishlistContext || (currentUser && isLoadingProducts)) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading your wishlist...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <HeartCrack className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-3">Your Wishlist is Private</h2>
        <p className="text-muted-foreground mb-8">
          Please log in to view or add items to your wishlist.
        </p>
        <Button asChild size="lg">
          <Link href="/login?redirect=/wishlist">
            <LogIn className="mr-2 h-5 w-5" /> Login to View Wishlist
          </Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Your Wishlist</h1>
        </div>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Your Wishlist</h1>
      </div>
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
    </div>
  );
}
