// @/context/cart-context.tsx
"use client";

import type { Product, CartItemData } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  writeBatch,
  getDocs,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

interface CartContextType {
  cartItems: CartItemData[];
  addToCart: (product: Product, selectedSize: string, selectedColor?: string | null, quantity?: number) => Promise<void>;
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
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeDb: () => void = () => {};
    if (currentUser) {
      setIsLoadingCart(true);
      const cartColRef = collection(db, "users", currentUser.uid, "cart");
      const q = query(cartColRef);

      unsubscribeDb = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({
          ...(docSnap.data() as Omit<CartItemData, 'id'>),
          id: docSnap.id,
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

  const getCartItemId = (productId: string, selectedSize: string, selectedColor?: string | null): string => {
    let id = `${productId}_${selectedSize.replace(/\s+/g, '-')}`;
    if (selectedColor) {
      id += `_${selectedColor.replace(/\s+/g, '-')}`;
    }
    return id;
  };

  const addToCart = useCallback(async (product: Product, selectedSize: string, selectedColor?: string | null, quantity: number = 1) => {
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
    const cartItemId = getCartItemId(product.id, selectedSize, selectedColor);
    const cartItemRef = doc(db, "users", currentUser.uid, "cart", cartItemId);

    try {
      const existingCartItemDoc = await getDoc(cartItemRef);

      if (existingCartItemDoc.exists()) {
        const existingCartItemData = existingCartItemDoc.data() as CartItemData;
        const newQuantity = existingCartItemData.quantity + quantity;
        const maxQuantity = product.stock ?? Infinity;
        await updateDoc(cartItemRef, { quantity: Math.min(newQuantity, maxQuantity) });
        toast({ title: "Cart Updated", description: `${product.name} quantity increased.` });
      } else {
        const cartItemData: CartItemData = {
          // Cart-specific fields first
          id: cartItemId,
          productId: product.id,
          quantity,
          selectedSize,
          selectedColor: selectedColor || null,
          addedAt: serverTimestamp(),

          // Fields from Product
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice !== undefined ? product.originalPrice : null,
          imageUrl: product.imageUrl,
          stock: product.stock !== undefined ? product.stock : null,
          dataAiHint: product.dataAiHint || null,
          sku: product.sku || null,
          
          // Offer dates, ensure they are null if not present on the product
          offerStartDate: product.offerStartDate || null,
          offerEndDate: product.offerEndDate || null,
        };
        await setDoc(cartItemRef, cartItemData);
        toast({ title: "Added to Cart!", description: `${product.name} (Size: ${selectedSize}) added.` });
      }
    } catch (error: any) {
      console.error("Error adding/updating cart item in Firestore:", error);
      console.error("Data sent to Firestore for cart item:", JSON.stringify(product, null, 2)); // Log the product object
      toast({ title: "Error", description: `Could not update your cart. ${error.message}`, variant: "destructive" });
    } finally {
      setIsLoadingCart(false);
    }
  }, [currentUser, toast, cartItems]); // cartItems was here, might not be needed if we fetch before update.

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!currentUser) return;
    if (!cartItemId) {
        console.error("removeFromCart called with undefined cartItemId");
        return;
    }
    const cartItemRef = doc(db, "users", currentUser.uid, "cart", cartItemId);
    try {
      await deleteDoc(cartItemRef);
      // Toast is removed as onSnapshot will update UI which is feedback enough
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
        // Potentially fetch the item from Firestore if not found locally, though onSnapshot should keep it synced.
        // For now, we'll assume it should be in local state if valid.
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
       // Toast is removed as onSnapshot will update UI
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
      if (snapshot.empty) {
        setIsLoadingCart(false);
        return;
      }
      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
      await batch.commit();
      // Local state updates via onSnapshot, toast not strictly needed here either
    } catch (error) {
      console.error("Error clearing cart in Firestore:", error);
      toast({ title: "Error", description: "Could not clear your cart.", variant: "destructive" });
    } finally {
      // setIsLoadingCart(false); // onSnapshot will handle this
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
