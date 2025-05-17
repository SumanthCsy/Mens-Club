
// @/app/checkout/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ShippingForm, type ShippingFormValues } from '@/components/checkout/shipping-form';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, ShoppingCart, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { Order, OrderItem, ShippingAddress as ShippingAddressType, UserData } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [initialShippingData, setInitialShippingData] = useState<Partial<ShippingFormValues>>({});
  const [isLoadingShippingData, setIsLoadingShippingData] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user's default shipping address
        try {
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
                email: userData.defaultShippingAddress.email || user.email || '', // Prioritize shipping email
              };
            }
          }
          setInitialShippingData(prefillData);
        } catch (error) {
          console.error("Error fetching default shipping address:", error);
          toast({ title: "Error", description: "Could not load saved address.", variant: "destructive"});
        } finally {
          setIsLoadingShippingData(false);
        }
      } else {
        setCurrentUser(null);
        setInitialShippingData({ email: '' }); // Clear prefill data if logged out
        setIsLoadingShippingData(false);
      }
    });
    return () => unsubscribe();
  }, [toast]);


  useEffect(() => {
    // Redirect if cart is empty, but not if already on success page or if order is being placed
    if (cartItems.length === 0 && !isPlacingOrder && router.asPath && !router.asPath.startsWith('/checkout/success') && !router.asPath.startsWith('/checkout')) {
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
      toast({ title: "Shipping Details Required", description: "Please submit your shipping details first.", variant: "destructive" });
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
    
    const newOrderPayload: Omit<Order, 'id' | 'cancellationReason' | 'cancelledBy'> = {
      userId: currentUser.uid,
      customerEmail: shippingData.email, // Use email from shipping form
      items: orderItemsForDb,
      subtotal: cartTotal,
      shippingCost: shippingCost,
      grandTotal: grandTotal,
      shippingAddress: shippingAddressForDb,
      paymentMethod: selectedPaymentMethod,
      status: 'Pending' as Order['status'],
      createdAt: serverTimestamp(),
      discount: null, // Explicitly null if no discount logic implemented
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), newOrderPayload);
      
      // Save shipping address as default for the user
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          await updateDoc(userDocRef, { defaultShippingAddress: shippingAddressForDb }, { merge: true });
        } catch (userUpdateError) {
          console.error("Error updating user's default shipping address:", userUpdateError);
          // Non-critical, so don't block order success, but log it.
        }
      }
      
      clearCart();
      router.push(`/checkout/success/${docRef.id}`); 
      
    } catch (error: any) {
      console.error("Data being sent to Firestore for order save:", JSON.stringify(newOrderPayload, null, 2));
      console.error("Full Firestore error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      console.error("Firebase error code:", error.code);
      console.error("Firebase error message:", error.message);

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

  if (cartItems.length === 0 && !isPlacingOrder && router.asPath && !router.asPath.startsWith('/checkout/success') && router.asPath && !router.asPath.startsWith('/checkout')) {
    // This check might become redundant due to the useEffect redirect
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

  if (isLoadingShippingData) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading checkout details...</p>
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
            initialData={initialShippingData} // Pass initialData here
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
            showPromoCodeInput={true}
            // Removed checkoutButtonText and checkoutLink to hide the button in CartSummary
            // The main "Place Order Securely" button below will be used.
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
