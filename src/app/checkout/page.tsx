// @/app/checkout/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
// import { sampleCartItems } from '@/lib/placeholder-data'; // Removed sample data
import type { CartItemData } from '@/types';
import { Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function CheckoutPage() {
  // Cart items would typically come from a global state or context, not directly from samples
  const [cartItems, setCartItems] = useState<CartItemData[]>([]); 
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // In a real app, cart items would be fetched from a global state / context / localStorage
    // For now, we assume it's managed elsewhere and might be empty.
    // The cart summary will reflect the items passed to it.
    // If cartItems state remains empty, summary will show 0.

    // Redirect if cart is empty (this check should ideally use the actual cart state management)
    if (cartItems.length === 0) { // This check becomes more critical now
        toast({
            title: "Your cart is empty",
            description: "Please add items to your cart before proceeding to checkout.",
            variant: "default", // Changed to default for less aggressive messaging
        });
        router.push('/cart');
    }
  }, [cartItems, router, toast]); // Depend on cartItems to re-check if it changes

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = cartItems.length > 0 ? 50.00 : 0; // Example fixed shipping in INR
  const total = subtotal + shippingCost;

  const handleShippingSubmit = (data: any) => {
    console.log("Shipping Data:", data);
    toast({
      title: "Shipping Details Saved",
      description: "Your shipping address has been updated.",
    });
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
        toast({
            title: "Cannot Place Order",
            description: "Your cart is empty. Please add items to your cart.",
            variant: "destructive",
        });
        return;
    }
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Placing order with method:", selectedPaymentMethod, "and items:", cartItems);
    toast({
      title: "Order Placed (Simulated)!",
      description: `Your order has been successfully placed with ${selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Simulated)'}. Thank you for shopping!`,
      duration: 5000,
    });
    
    setCartItems([]); // Clear cart (simulated)
    // router.push('/order-confirmation'); // Optional: Redirect to a confirmation page
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Checkout</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Almost there! Please complete your order details.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ShippingForm onSubmit={handleShippingSubmit} />
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
          />
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <CartSummary
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            checkoutButtonText="Place Order Securely" 
            showPromoCodeInput={false}
            checkoutLink="#" // Handled by external button
          />
          <Button 
            size="lg" 
            className="w-full text-base group mt-6" 
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0} 
          >
            <Lock className="mr-2 h-5 w-5" /> Place Order Securely
          </Button>
          <Button asChild variant="link" className="mt-4 w-full text-primary">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
