
// @/context/wishlist-context.tsx
"use client";

import type { Product } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlistItems: string[]; // Array of product IDs
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isProductInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedWishlistItems = localStorage.getItem('mensClubWishlist');
    if (storedWishlistItems) {
      try {
        const parsedItems = JSON.parse(storedWishlistItems);
        if (Array.isArray(parsedItems)) {
          setWishlistItems(parsedItems);
        }
      } catch (error) {
        console.error("Error parsing wishlist items from localStorage:", error);
        localStorage.removeItem('mensClubWishlist');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mensClubWishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (productId: string) => {
    if (!productId) {
      console.error("Product ID is undefined.");
      toast({ title: "Error", description: "Could not add item to wishlist.", variant: "destructive" });
      return;
    }
    setWishlistItems(prevItems => {
      if (prevItems.includes(productId)) {
        return prevItems; // Already in wishlist
      }
      return [...prevItems, productId];
    });
    toast({
      title: "Added to Wishlist!",
      description: `Item has been added to your wishlist.`,
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prevItems => prevItems.filter(id => id !== productId));
    toast({
      title: "Removed from Wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };

  const isProductInWishlist = (productId: string): boolean => {
    return wishlistItems.includes(productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isProductInWishlist,
        wishlistCount,
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
