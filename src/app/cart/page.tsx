
// @/app/cart/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { CartItemCard } from '@/components/cart/cart-item-card';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart-context'; // Import useCart

export default function CartPage() {
  const { cartItems, removeFromCart, updateCartItemQuantity, cartTotal } = useCart();
  const [isLoading, setIsLoading] = useState(true); // Keep loading state

  useEffect(() => {
    // Cart items are now managed by context, which handles localStorage.
    // We can set loading to false once context is likely initialized.
    // A small delay or check might be needed if context initialization itself is async
    // but for localStorage sync, it should be quick.
    setIsLoading(false); 
  }, []);


  // Shipping could be calculated based on cart items or address later
  const shippingEstimate = cartItems.length > 0 ? 50.00 : 0; // Example fixed shipping in INR
  const total = cartTotal + shippingEstimate;

  if (isLoading) { // This might only show briefly or not at all if context loads fast
     return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary mb-4 animate-spin" />
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
                key={item.id + (item.selectedSize || '')} // Ensure key is unique if sizes differ
                item={item}
                onRemoveItem={removeFromCart}
                onUpdateQuantity={updateCartItemQuantity}
              />
            ))}
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <CartSummary
              subtotal={cartTotal}
              shippingCost={shippingEstimate}
              total={total}
              showCheckoutButton={true} // Explicitly show button on cart page
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
