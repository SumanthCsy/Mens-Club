// @/context/cart-context.tsx
"use client";

import type { Product, CartItemData } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import type { User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

interface CartContextType {
  cartItems: CartItemData[];
  addToCart: (product: Product, selectedSize: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartItemQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  isLoadingCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        setCartItems([]);
        setIsLoadingCart(false);
      }
      // Fetching cart will be triggered by currentUser change in the next useEffect
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeDb: () => void = () => {};
    if (currentUser) {
      setIsLoadingCart(true);
      const cartColRef = collection(db, "users", currentUser.uid, "cart");
      const q = query(cartColRef); // Can add orderBy if needed, e.g., orderBy("addedAt")

      unsubscribeDb = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({
          ...(docSnap.data() as Omit<CartItemData, 'id'>), // Firestore data doesn't have id field
          id: docSnap.id, // Use Firestore document ID as cart item's primary ID
        } as CartItemData));
        setCartItems(items);
        setIsLoadingCart(false);
      }, (error) => {
        console.error("Error fetching cart in real-time:", error);
        toast({ title: "Error", description: "Could not load your cart.", variant: "destructive" });
        setIsLoadingCart(false);
      });
    } else {
      setCartItems([]);
      setIsLoadingCart(false);
    }
    return () => unsubscribeDb();
  }, [currentUser, toast]);

  const getCartItemId = (productId: string, selectedSize: string): string => {
    // Create a consistent ID for cart items based on product and size.
    // Color could be added if it differentiates unique cart entries.
    return `${productId}_${selectedSize.replace(/\s+/g, '-')}`;
  };

  const addToCart = useCallback(async (product: Product, selectedSize: string, quantity: number = 1) => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to add items to your cart." });
      return;
    }
    if (!product || !product.id) {
      console.error("Product or product ID is undefined.", product);
      toast({ title: "Error", description: "Could not add item: Product information missing.", variant: "destructive" });
      return;
    }
    if (typeof product.stock === 'number' && product.stock < 1) {
      toast({ title: "Out of Stock", description: `${product.name} is currently out of stock.`, variant: "destructive"});
      return;
    }

    setIsLoadingCart(true);
    const cartItemId = getCartItemId(product.id, selectedSize);
    const cartItemRef = doc(db, "users", currentUser.uid, "cart", cartItemId);

    try {
      const existingCartItem = cartItems.find(item => item.id === cartItemId); // Check local state first

      if (existingCartItem) {
        const newQuantity = existingCartItem.quantity + quantity;
        const maxQuantity = product.stock ?? Infinity;
        await updateDoc(cartItemRef, { quantity: Math.min(newQuantity, maxQuantity) });
        toast({ title: "Cart Updated", description: `${product.name} quantity increased.` });
      } else {
        const cartItemData: CartItemData = {
          ...product, // Spread all product properties
          cartItemId: cartItemId, // Store the generated cart item ID
          productId: product.id, // Explicitly store productId from product
          quantity,
          selectedSize,
          // selectedColor can be added if necessary
          addedAt: serverTimestamp(), // Optional: for sorting
        };
        await setDoc(cartItemRef, cartItemData);
        toast({ title: "Added to Cart!", description: `${product.name} (Size: ${selectedSize}) added.` });
      }
    } catch (error) {
      console.error("Error adding/updating cart item in Firestore:", error);
      toast({ title: "Error", description: "Could not update your cart.", variant: "destructive" });
    } finally {
      setIsLoadingCart(false); // May not be needed if onSnapshot handles this
    }
  }, [currentUser, toast, cartItems]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!currentUser) return; // Should not happen if UI prevents for logged out
    if (!cartItemId) {
        console.error("removeFromCart called with undefined cartItemId");
        return;
    }
    // cartItemId is now the Firestore document ID
    const cartItemRef = doc(db, "users", currentUser.uid, "cart", cartItemId);
    try {
      await deleteDoc(cartItemRef);
      toast({ title: "Item Removed", description: "Item removed from your cart." });
    } catch (error) {
      console.error("Error removing cart item from Firestore:", error);
      toast({ title: "Error", description: "Could not remove item from cart.", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const updateCartItemQuantity = useCallback(async (cartItemId: string, newQuantity: number) => {
    if (!currentUser) return;
    if (!cartItemId) {
        console.error("updateCartItemQuantity called with undefined cartItemId");
        return;
    }

    const itemToUpdate = cartItems.find(item => item.id === cartItemId);
    if (!itemToUpdate) {
        console.error("Item not found in local cart state for update:", cartItemId);
        return;
    }

    const cartItemRef = doc(db, "users", currentUser.uid, "cart", cartItemId);
    try {
      const maxQuantity = itemToUpdate.stock ?? Infinity;
      const validatedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
      await updateDoc(cartItemRef, { quantity: validatedQuantity });
       if (newQuantity > maxQuantity && typeof itemToUpdate.stock === 'number') {
         toast({
            title: "Stock Limit Reached",
            description: `Only ${itemToUpdate.stock} units of ${itemToUpdate.name} available.`,
            variant: "default"
        })
       }
    } catch (error) {
      console.error("Error updating cart item quantity in Firestore:", error);
      toast({ title: "Error", description: "Could not update item quantity.", variant: "destructive" });
    }
  }, [currentUser, toast, cartItems]);

  const clearCart = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingCart(true);
    const cartColRef = collection(db, "users", currentUser.uid, "cart");
    try {
      const snapshot = await getDocs(cartColRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
      await batch.commit();
      // Local state updates via onSnapshot
    } catch (error) {
      console.error("Error clearing cart in Firestore:", error);
      toast({ title: "Error", description: "Could not clear your cart.", variant: "destructive" });
    } finally {
      setIsLoadingCart(false);
    }
  }, [currentUser, toast]);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isLoadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
