// @/app/cart/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { CartItemCard } from '@/components/cart/cart-item-card';
import { CartSummary } from '@/components/cart/cart-summary';
import { sampleCartItems as initialCartItems } from '@/lib/placeholder-data';
import type { CartItemData } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching cart items
    setCartItems(initialCartItems);
    setIsLoading(false);
  }, []);

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Shipping and discount can be calculated here or passed from a backend
  const shippingEstimate = cartItems.length > 0 ? 5.00 : 0; // Example fixed shipping
  const total = subtotal + shippingEstimate;

  if (isLoading) {
     return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-primary mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold">Loading Your Cart...</h1>
      </div>
    );
  }


  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-center">Your Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/60 rounded-lg shadow-sm">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild size="lg">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-5 w-5" /> Continue Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map(item => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24"> {/* Sticky summary for desktop */}
            <CartSummary
              subtotal={subtotal}
              shippingCost={shippingEstimate}
              total={total}
            />
             <Button asChild variant="link" className="mt-6 w-full text-primary">
               <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
               </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
