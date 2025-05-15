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

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('online');
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching cart items for summary
    setCartItems(sampleCartItems); 
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 5.00; // Example, this could be dynamic
  const total = subtotal + shippingCost;

  const handleShippingSubmit = (data: any) => {
    console.log("Shipping Data:", data);
    // Proceed to next step or validation
    toast({
      title: "Shipping Details Saved",
      description: "Your shipping address has been updated.",
    });
  };

  const handlePlaceOrder = () => {
    // Form validation for shipping should happen before this
    // For now, just log and show toast
    console.log("Placing order with method:", selectedPaymentMethod);
    toast({
      title: "Order Placed!",
      description: `Your order has been successfully placed with ${selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}. Thank you for shopping!`,
      duration: 5000,
    });
    // Potentially redirect to an order confirmation page
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
