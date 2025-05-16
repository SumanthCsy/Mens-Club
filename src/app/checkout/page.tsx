
// @/app/checkout/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context'; // Import useCart

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod'); // Default to COD
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (cartItems.length === 0) {
        toast({
            title: "Your cart is empty",
            description: "Please add items to your cart before proceeding to checkout.",
            variant: "default",
        });
        router.push('/cart');
    }
  }, [cartItems, router, toast]);

  const shippingCost = cartItems.length > 0 ? 50.00 : 0; // Example fixed shipping in INR
  const total = cartTotal + shippingCost;

  const handleShippingSubmit = (data: any) => {
    // In a real app, you'd save this to user profile or order details
    console.log("Shipping Data:", data);
    toast({
      title: "Shipping Details Saved",
      description: "Your shipping address has been updated.",
    });
    // You might want to proceed to next step or enable payment section here
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
    
    // Simulate order placement
    console.log("Placing order with method:", selectedPaymentMethod, "and items:", cartItems);
    // In a real app, this would involve API calls to your backend to process the order
    // and payment gateway integration if online payment is selected.

    toast({
      title: "Order Placed (Simulated)!",
      description: `Your order has been successfully placed with ${selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Simulated)'}. Thank you for shopping!`,
      duration: 7000,
    });
    
    clearCart(); // Clear cart items from context and localStorage
    router.push('/'); // Redirect to homepage or an order confirmation page
  };

  if (cartItems.length === 0 && router.asPath && !router.asPath.startsWith('/checkout')) { // Prevent flash if already redirecting
    return (
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4"/>
            <h1 className="text-2xl font-semibold">Your cart is empty.</h1>
            <p className="text-muted-foreground mt-2 mb-6">Redirecting you to continue shopping...</p>
            <Button asChild>
                <Link href="/products">Shop Now</Link>
            </Button>
        </div>
    );
  }


  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10 text-center">
         <Button variant="outline" size="sm" asChild className="mb-4 float-left">
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
          </Link>
        </Button>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground pt-2">Checkout</h1>
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
            subtotal={cartTotal}
            shippingCost={shippingCost}
            total={total}
            checkoutButtonText="Place Order Securely" 
            showPromoCodeInput={true} // Can be true if you have promo logic
            checkoutLink="#" // Handled by external button below
          />
          <Button 
            size="lg" 
            className="w-full text-base group mt-6" 
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0} 
            suppressHydrationWarning={true}
          >
            <Lock className="mr-2 h-5 w-5" /> Place Order Securely
          </Button>
        </div>
      </div>
    </div>
  );
}
