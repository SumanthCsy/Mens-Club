
// @/context/wishlist-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import type { User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, getDocs, serverTimestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';

interface WishlistContextType {
  wishlistItems: string[]; // Array of product IDs
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isProductInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isLoadingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  const { toast } = useToast();

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        setWishlistItems([]); // Clear wishlist if user logs out
        setIsLoadingWishlist(false);
      }
      // Fetching wishlist will be triggered by currentUser change in the next useEffect
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch wishlist from Firestore when user logs in or changes
  useEffect(() => {
    let unsubscribeDb: Unsubscribe | undefined = undefined;
    if (currentUser) {
      setIsLoadingWishlist(true);
      const wishlistColRef = collection(db, "users", currentUser.uid, "wishlist");
      
      unsubscribeDb = onSnapshot(wishlistColRef, (snapshot) => {
        const items = snapshot.docs.map(doc => doc.id);
        setWishlistItems(items);
        setIsLoadingWishlist(false);
      }, (error) => {
        console.error("Error fetching wishlist in real-time:", error);
        toast({ title: "Error", description: "Could not load wishlist.", variant: "destructive" });
        setIsLoadingWishlist(false);
      });

    } else {
      setWishlistItems([]); // Clear for logged-out users
      setIsLoadingWishlist(false);
    }
    // Cleanup Firestore listener on unmount or when currentUser changes
    return () => {
      if (unsubscribeDb) {
        unsubscribeDb();
      }
    };
  }, [currentUser, toast]);


  const addToWishlist = useCallback(async (productId: string) => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to add items to your wishlist.", variant: "default" });
      return;
    }
    if (!productId) {
      console.error("Product ID is undefined.");
      toast({ title: "Error", description: "Could not add item to wishlist.", variant: "destructive" });
      return;
    }

    try {
      const wishlistItemRef = doc(db, "users", currentUser.uid, "wishlist", productId);
      await setDoc(wishlistItemRef, { 
        productId: productId, // Storing productId in document as well for potential querying
        addedAt: serverTimestamp() 
      });
      // Local state will be updated by the onSnapshot listener
      toast({
        title: "Added to Wishlist!",
        description: `Item has been added to your wishlist.`,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({ title: "Error", description: "Failed to add item to wishlist.", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!currentUser) {
      // This case should ideally not be reached if UI prevents action for logged-out users
      toast({ title: "Login Required", description: "Please log in to manage your wishlist.", variant: "default" });
      return;
    }
    try {
      const wishlistItemRef = doc(db, "users", currentUser.uid, "wishlist", productId);
      await deleteDoc(wishlistItemRef);
      // Local state will be updated by the onSnapshot listener
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({ title: "Error", description: "Failed to remove item from wishlist.", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const isProductInWishlist = useCallback((productId: string): boolean => {
    return wishlistItems.includes(productId);
  }, [wishlistItems]);

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isProductInWishlist,
        wishlistCount,
        isLoadingWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
