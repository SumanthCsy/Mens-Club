
// @/app/checkout/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ShippingForm, type ShippingFormValues } from '@/components/checkout/shipping-form';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { Order, OrderItem, ShippingAddress as ShippingAddressType, UserData } from '@/types';
import type { User } from 'firebase/auth';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initialShippingData, setInitialShippingData] = useState<Partial<ShippingFormValues>>({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let prefillData: Partial<ShippingFormValues> = { email: user.email || '' };
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserData;
          if (userData.defaultShippingAddress) {
            prefillData = {
              ...prefillData,
              fullName: userData.defaultShippingAddress.fullName || '',
              addressLine1: userData.defaultShippingAddress.addressLine1 || '',
              addressLine2: userData.defaultShippingAddress.addressLine2 || '',
              city: userData.defaultShippingAddress.city || '',
              stateProvince: userData.defaultShippingAddress.stateProvince || '',
              postalCode: userData.defaultShippingAddress.postalCode || '',
              country: userData.defaultShippingAddress.country || 'India',
              phoneNumber: userData.defaultShippingAddress.phoneNumber || '',
              email: userData.defaultShippingAddress.email || user.email || '',
            };
          }
        }
        setInitialShippingData(prefillData);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (cartItems.length === 0 && !isPlacingOrder && router.asPath && !router.asPath.startsWith('/checkout')) {
        toast({
            title: "Your cart is empty",
            description: "Please add items to your cart before proceeding to checkout.",
            variant: "default",
        });
        router.push('/cart');
    }
  }, [cartItems, router, toast, isPlacingOrder]);

  const shippingCost = cartItems.length > 0 ? 50.00 : 0;
  const grandTotal = cartTotal + shippingCost;

  const handleShippingSubmit = (data: ShippingFormValues) => {
    setShippingData(data);
    toast({
      title: "Shipping Details Saved",
      description: "Your shipping address has been confirmed.",
    });
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please login to place an order.", variant: "destructive" });
      router.push('/login?redirect=/checkout');
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Cannot Place Order", description: "Your cart is empty.", variant: "destructive" });
      return;
    }
    if (!shippingData) {
      toast({ title: "Shipping Details Required", description: "Please submit your shipping details.", variant: "destructive" });
      return;
    }
    if (!selectedPaymentMethod) {
      toast({ title: "Payment Method Required", description: "Please select a payment method.", variant: "destructive" });
      return;
    }

    setIsPlacingOrder(true);

    const orderItemsForDb: OrderItem[] = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor || null,
      imageUrl: item.imageUrl || 'https://placehold.co/100x133.png',
      sku: item.sku || null,
    }));

    const shippingAddressForDb: ShippingAddressType = {
      fullName: shippingData.fullName,
      addressLine1: shippingData.addressLine1,
      addressLine2: shippingData.addressLine2 || null,
      city: shippingData.city,
      stateProvince: shippingData.stateProvince,
      postalCode: shippingData.postalCode,
      country: shippingData.country,
      phoneNumber: shippingData.phoneNumber || null,
      email: shippingData.email,
    };

    const orderToSave: Omit<Order, 'id'> = {
      userId: currentUser.uid,
      customerEmail: shippingData.email,
      items: orderItemsForDb,
      subtotal: cartTotal,
      shippingCost: shippingCost,
      grandTotal: grandTotal,
      shippingAddress: shippingAddressForDb,
      paymentMethod: selectedPaymentMethod,
      status: 'Pending',
      createdAt: serverTimestamp(),
    };

    console.log("Attempting to save order:", JSON.stringify(orderToSave, null, 2));

    try {
      const docRef = await addDoc(collection(db, "orders"), orderToSave);
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${docRef.id} has been placed.`,
        duration: 7000,
      });

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { defaultShippingAddress: shippingAddressForDb });
      }

      try {
        const emailResponse = await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: docRef.id,
            customerEmail: orderToSave.customerEmail,
            grandTotal: orderToSave.grandTotal,
            adminEmail: "sumanthcherla12@gmail.com"
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json().catch(() => ({ message: "Failed to parse error response from email API." }));
          console.error('Failed to send order notification email:', errorData);
          toast({
            title: "Notification Error",
            description: `Order placed, but failed to send admin notification. ${errorData.message || "Unknown API error."}`.trim(),
            variant: "destructive",
            duration: 7000
          });
        } else {
            const successData = await emailResponse.json();
            console.log('Admin notification email prepared successfully:', successData.message);
        }
      } catch (emailError) {
        console.error('Error calling send-order-email API:', emailError);
         toast({
            title: "Notification Error",
            description: "Order placed, but encountered an issue preparing admin notification.",
            variant: "destructive",
            duration: 7000
          });
      }

      clearCart();
      router.push('/');
    } catch (error: any) {
      console.error("Data being sent to Firestore for order save:", JSON.stringify(orderToSave, null, 2));
      console.error("Full Firestore error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

      toast({
        title: "Order Placement Failed",
        description: `Error: ${error.message || 'An unknown error occurred.'}. Please check console for more details.`,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0 && router.asPath && !router.asPath.startsWith('/checkout') && !isPlacingOrder) {
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
          <ShippingForm
            onSubmit={handleShippingSubmit}
            initialData={initialShippingData}
          />
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
          />
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <CartSummary
            subtotal={cartTotal}
            shippingCost={shippingCost}
            total={grandTotal}
            checkoutButtonText="Place Order Securely"
            showPromoCodeInput={true}
            checkoutLink="#"
          />
          <Button
            size="lg"
            className="w-full text-base group mt-6"
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0 || isPlacingOrder || !shippingData}
            suppressHydrationWarning={true}
          >
            {isPlacingOrder ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Lock className="mr-2 h-5 w-5" />
            )}
            Place Order Securely
          </Button>
          {!shippingData && cartItems.length > 0 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
                Please save your shipping details to enable order placement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

