
// @/context/cart-context.tsx
"use client";

import type { Product, CartItemData } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItemData[];
  addToCart: (product: Product, selectedSize: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedCartItems = localStorage.getItem('mensClubCart');
    if (storedCartItems) {
      try {
        const parsedItems = JSON.parse(storedCartItems);
        if (Array.isArray(parsedItems)) {
          setCartItems(parsedItems);
        } else {
          console.warn("Stored cart items are not in the expected array format.");
          setCartItems([]);
          localStorage.removeItem('mensClubCart'); // Clear invalid data
        }
      } catch (error) {
        console.error("Error parsing cart items from localStorage:", error);
        setCartItems([]); // Reset cart if parsing fails
        localStorage.removeItem('mensClubCart'); // Clear invalid data
      }
    }
  }, []);

  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem('mensClubCart')) {
        localStorage.setItem('mensClubCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product: Product, selectedSize: string, quantity: number = 1) => {
    if (!product || !product.id) {
      console.error("Product or product ID is undefined.", product);
      toast({ title: "Error", description: "Could not add item to cart. Product information missing.", variant: "destructive" });
      return;
    }
     if (typeof product.stock === 'number' && product.stock < 1) {
      toast({ title: "Out of Stock", description: `${product.name} is currently out of stock.`, variant: "destructive"});
      return;
    }

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.selectedSize === selectedSize
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = prevItems.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = item.quantity + quantity;
            const maxQuantity = product.stock ?? Infinity; // Use product.stock if available, else no limit
            return {
              ...item,
              quantity: Math.min(newQuantity, maxQuantity),
            };
          }
          return item;
        });
      } else {
        newItems = [
          ...prevItems,
          {
            ...product,
            quantity,
            selectedSize,
            // selectedColor could be added here if relevant
          },
        ];
      }
      return newItems;
    });
    toast({
      title: "Added to Cart!",
      description: `${product.name} (Size: ${selectedSize}) has been added.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    });
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const maxQuantity = item.stock ?? Infinity;
          const validatedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
           if (newQuantity > maxQuantity && typeof item.stock === 'number') {
             toast({
                title: "Stock Limit Reached",
                description: `Only ${item.stock} units of ${item.name} available.`,
                variant: "default"
            })
           }
          return { ...item, quantity: validatedQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

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
