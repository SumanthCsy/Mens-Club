
// @/app/checkout/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ShippingForm, type ShippingFormValues } from '@/components/checkout/shipping-form';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, ShoppingCart, Loader2, CheckCircle, Edit, Home, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { Order, OrderItem, ShippingAddress as ShippingAddressType, UserData } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingInitialAddress, setIsLoadingInitialAddress] = useState(true);
  
  // Stores the address confirmed for the current order
  const [currentConfirmedShippingAddress, setCurrentConfirmedShippingAddress] = useState<ShippingFormValues | null>(null);
  // Stores the default address fetched from Firestore (if any)
  const [defaultShippingAddress, setDefaultShippingAddress] = useState<Partial<ShippingFormValues> | null>(null);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormMode, setAddressFormMode] = useState<'new' | 'edit'>('new'); // 'new' or 'edit'

  // Effect for auth state and fetching default address
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoadingInitialAddress(true);
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData;
            if (userData.defaultShippingAddress) {
              const fetchedDefaultAddress = userData.defaultShippingAddress as ShippingFormValues;
              setDefaultShippingAddress(fetchedDefaultAddress);
              setCurrentConfirmedShippingAddress(fetchedDefaultAddress); // Use default for current order initially
              setShowAddressForm(false); // Hide form if default is available
            } else {
              // No default address, show form to add new
              setShowAddressForm(true); 
              setAddressFormMode('new');
              setCurrentConfirmedShippingAddress(null); // No address confirmed yet
            }
          } else {
            // No user document, show form to add new
            setShowAddressForm(true); 
            setAddressFormMode('new');
            setCurrentConfirmedShippingAddress(null);
          }
        } catch (error) {
          console.error("Error fetching default shipping address:", error);
          toast({ title: "Error", description: "Could not load saved address.", variant: "destructive"});
          setShowAddressForm(true); // Fallback to showing form
          setAddressFormMode('new');
          setCurrentConfirmedShippingAddress(null);
        }
      } else {
        // No user logged in
        setCurrentUser(null);
        setDefaultShippingAddress(null);
        setCurrentConfirmedShippingAddress(null);
        setShowAddressForm(true); // Require address entry for guest or new user
        setAddressFormMode('new');
      }
      setIsLoadingInitialAddress(false);
    });
    return () => unsubscribe();
  }, [toast]);


  useEffect(() => {
    if (cartItems.length === 0 && !isPlacingOrder && router.asPath && !router.asPath.startsWith('/checkout/success')) {
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

  const handleShippingFormSubmit = (data: ShippingFormValues) => {
    setCurrentConfirmedShippingAddress(data);
    setShowAddressForm(false); // Hide form after submission
    toast({
      title: "Address Confirmed",
      description: "Your shipping address for this order has been confirmed.",
    });
  };

  const handleEditAddress = () => {
    setAddressFormMode('edit');
    setShowAddressForm(true);
  };

  const handleAddNewAddress = () => {
    setAddressFormMode('new');
    setShowAddressForm(true);
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
    if (!currentConfirmedShippingAddress) {
      toast({ title: "Shipping Address Required", description: "Please confirm your shipping address first.", variant: "destructive" });
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
      fullName: currentConfirmedShippingAddress.fullName,
      addressLine1: currentConfirmedShippingAddress.addressLine1,
      addressLine2: currentConfirmedShippingAddress.addressLine2 || null,
      city: currentConfirmedShippingAddress.city,
      stateProvince: currentConfirmedShippingAddress.stateProvince,
      postalCode: currentConfirmedShippingAddress.postalCode,
      country: currentConfirmedShippingAddress.country,
      phoneNumber: currentConfirmedShippingAddress.phoneNumber || null,
      email: currentConfirmedShippingAddress.email,
    };
    
    const newOrderPayload: Omit<Order, 'id' | 'cancellationReason' | 'cancelledBy'> = {
      userId: currentUser.uid,
      customerEmail: currentConfirmedShippingAddress.email, 
      items: orderItemsForDb,
      subtotal: cartTotal,
      shippingCost: shippingCost,
      grandTotal: grandTotal,
      shippingAddress: shippingAddressForDb,
      paymentMethod: selectedPaymentMethod,
      status: 'Pending' as Order['status'],
      createdAt: serverTimestamp(),
      discount: null, 
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), newOrderPayload);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          await updateDoc(userDocRef, { defaultShippingAddress: shippingAddressForDb }, { merge: true });
        } catch (userUpdateError) {
          console.error("Error updating user's default shipping address:", userUpdateError);
          // Don't fail the whole order for this, but log it.
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

  if (isLoadingInitialAddress) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading checkout details...</p>
      </div>
    );
  }

  // Determine what initial data to pass to the form
  let formInitialData: Partial<ShippingFormValues> = { country: "India", email: currentUser?.email || "" };
  if (addressFormMode === 'edit' && currentConfirmedShippingAddress) {
    formInitialData = { ...formInitialData, ...currentConfirmedShippingAddress };
  } else if (addressFormMode === 'new' && defaultShippingAddress && !currentConfirmedShippingAddress) {
    // If adding new but a default existed, start with a mostly blank form but keep email/country
    formInitialData = { country: "India", email: currentUser?.email || "" };
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
          {!showAddressForm && currentConfirmedShippingAddress ? (
            <Card className="shadow-lg border border-border/60">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center justify-between">
                  Shipping To
                  <Button variant="outline" size="sm" onClick={handleEditAddress}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Address
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-base">
                <p><strong>{currentConfirmedShippingAddress.fullName}</strong></p>
                <p>{currentConfirmedShippingAddress.addressLine1}</p>
                {currentConfirmedShippingAddress.addressLine2 && <p>{currentConfirmedShippingAddress.addressLine2}</p>}
                <p>{currentConfirmedShippingAddress.city}, {currentConfirmedShippingAddress.stateProvince} {currentConfirmedShippingAddress.postalCode}</p>
                <p>{currentConfirmedShippingAddress.country}</p>
                {currentConfirmedShippingAddress.phoneNumber && <p>Phone: {currentConfirmedShippingAddress.phoneNumber}</p>}
                <p>Email: {currentConfirmedShippingAddress.email}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" onClick={handleAddNewAddress} className="text-primary pl-0">
                  <PlusCircle className="mr-2 h-4 w-4" /> Use a Different Address
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <ShippingForm
              onSubmit={handleShippingFormSubmit}
              initialData={formInitialData}
            />
          )}

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
            showCheckoutButton={false} // Hide CartSummary's own button here
          />
          <Button
            size="lg"
            className="w-full text-base group mt-6"
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0 || isPlacingOrder || !currentConfirmedShippingAddress}
            suppressHydrationWarning={true}
          >
            {isPlacingOrder ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Lock className="mr-2 h-5 w-5" />
            )}
            Place Order Securely
          </Button>
          {!currentConfirmedShippingAddress && cartItems.length > 0 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
                Please confirm your shipping details to enable order placement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
