// @/app/checkout/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { sampleCartItems } from '@/lib/placeholder-data'; // For cart summary
import type { CartItemData } from '@/types';
import { Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  // Default to 'cod' (Cash on Delivery) since online is unavailable
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching cart items for summary
    // In a real app, this might come from a global state or API
    if (sampleCartItems.length > 0) {
        setCartItems(sampleCartItems);
    } else {
        // If cart is empty, consider redirecting or showing a message
        toast({
            title: "Your cart is empty",
            description: "Please add items to your cart before proceeding to checkout.",
            variant: "destructive",
        });
        router.push('/cart');
    }
  }, [router, toast]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = cartItems.length > 0 ? 5.00 : 0; // Example, this could be dynamic
  const total = subtotal + shippingCost;

  const handleShippingSubmit = (data: any) => {
    console.log("Shipping Data:", data);
    // This is a good place for validation before proceeding
    toast({
      title: "Shipping Details Saved",
      description: "Your shipping address has been updated.",
    });
    // You might want to scroll to payment section or enable it here
  };

  const handlePlaceOrder = () => {
    // Basic validation: ensure shipping form might have been "submitted" (though we don't enforce sequence here)
    // and a payment method is selected.
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }
    
    if (cartItems.length === 0) {
        toast({
            title: "Cannot Place Order",
            description: "Your cart is empty. Please add items to your cart.",
            variant: "destructive",
        });
        return;
    }

    console.log("Placing order with method:", selectedPaymentMethod);
    // Simulate order placement
    toast({
      title: "Order Placed (Simulated)!",
      description: `Your order has been successfully placed with ${selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Simulated)'}. Thank you for shopping!`,
      duration: 5000,
    });
    
    // Clear cart (simulated)
    // In a real app, this would happen after successful payment/order creation on backend
    setCartItems([]); 
    
    // Redirect to a confirmation page (optional)
    // router.push('/order-confirmation'); 
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
            showPromoCodeInput={false} // Promo code usually applied in cart
            checkoutLink="#" // Prevent direct navigation from summary button
          />
          <Button 
            size="lg" 
            className="w-full text-base group mt-6" 
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0} // Disable if cart is empty
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
