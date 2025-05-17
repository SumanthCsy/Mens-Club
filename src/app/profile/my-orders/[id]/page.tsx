
// @/app/profile/my-orders/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, User, MapPin, CreditCard, Loader2, AlertTriangle, ShoppingCart, BadgeIndianRupee, FileText, TruckIcon, ClipboardCopy, Eye, XCircle, Phone, MessageSquare, Info } from 'lucide-react';
import type { Order, OrderItem, ShippingAddress as ShippingAddressType } from '@/types';
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { OrderTrackingModal } from '@/components/orders/OrderTrackingModal';
import { InvoiceViewModal } from '@/components/orders/InvoiceViewModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderCancellationFormModal } from '@/components/orders/OrderCancellationFormModal';
import type { User as FirebaseUser } from 'firebase/auth';

export default function UserViewOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isCancelFormOpen, setIsCancelFormOpen] = useState(false);
  const [isShippedCancelInfoOpen, setIsShippedCancelInfoOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        // If user becomes null and we are not already erroring/loading for other reasons,
        // set error and stop loading.
        if (!error && isLoading) {
             setError("Please log in to view order details.");
             setIsLoading(false);
        }
        // Optionally redirect if strict auth is needed for this page
        // router.push('/login?redirect=/profile/my-orders'); 
      }
    });
    return () => unsubscribe();
  }, [router, error, isLoading]); // Added error & isLoading to deps for this auth effect

  useEffect(() => {
    // Ensure we only attempt to fetch if essential parameters are available
    if (!orderId) {
        setError("No order ID provided.");
        setIsLoading(false);
        return;
    }
    if (!currentUser) {
        // If currentUser is null, auth useEffect should handle setting error & loading
        // Or, if page is accessed directly without user yet, we might briefly show loading.
        // Setting error here could be redundant if auth listener sets it too.
        // For simplicity, we let the auth listener manage this for now.
        // If still loading from initial state, don't set error yet, wait for auth.
        if(!isLoading) {
            setError("Please log in to view order details.");
        }
        return;
    }

    const fetchOrder = async () => {
      setIsLoading(true); // Set loading true at the start of fetch attempt
      setError(null);
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const data = orderSnap.data();
          if (data.userId === currentUser.uid) {
            setOrder({
              id: orderSnap.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
            } as Order);
          } else {
            setError("Access denied. This order does not belong to you.");
            toast({ title: "Access Denied", description: "You do not have permission to view this order.", variant: "destructive" });
          }
        } else {
          setError("Order not found.");
          toast({ title: "Error", description: "Order not found.", variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details.");
        toast({ title: "Error", description: "Failed to load order details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, currentUser, toast]); // Corrected dependency array


  const handleCopyOrderId = async () => {
    if (!order || !order.id) return;
    try {
      await navigator.clipboard.writeText(order.id);
      toast({
        title: "Order ID Copied!",
        description: `${order.id} copied to clipboard.`,
      });
    } catch (err) {
      console.error("Failed to copy order ID: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy Order ID to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleRequestCancellation = () => {
    if (!order) return;
    setOrderToCancel(order);
    if (order.status === 'Shipped' || order.status === 'Delivered') {
      setIsShippedCancelInfoOpen(true);
    } else if (order.status === 'Pending' || order.status === 'Processing') {
      setIsConfirmCancelOpen(true);
    }
  };

  const proceedToCancellationForm = () => {
    setIsConfirmCancelOpen(false);
    if (orderToCancel) {
      setIsCancelFormOpen(true);
    }
  };

  const getWhatsAppCancellationLink = (orderId: string | undefined) => {
    if (!orderId) return "#";
    const message = encodeURIComponent(`I want to cancel my order ${orderId}`);
    return `https://wa.me/919391157177?text=${message}`;
  };


  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/profile/my-orders">Back to My Orders</Link>
        </Button>
      </div>
    );
  }
  
  if (!order) {
     return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">Order data could not be loaded.</p>
         <Button asChild className="mt-4">
          <Link href="/profile/my-orders">Back to My Orders</Link>
        </Button>
      </div>
    );
  }

  const { shippingAddress, items } = order;

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/profile/my-orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
          </Link>
        </Button>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
                <Package className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Order Details</h1>
                    <div className="flex items-center gap-2">
                        <p className="mt-1 text-md text-muted-foreground break-all">
                        Order ID: {order.id || 'N/A'}
                        </p>
                        {order.id && (
                          <Button variant="ghost" size="icon" onClick={handleCopyOrderId} className="h-7 w-7 -ml-1 text-muted-foreground hover:text-primary">
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                </div>
            </div>
             <span className={`px-3 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap
                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : ''}
                ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : ''}
                `}
            >
                Status: {order.status}
            </span>
        </div>
      </div>

    {order.status === 'Cancelled' && order.cancellationReason && (
        <Card className="mb-6 shadow-md border-destructive/50 bg-destructive/5 text-destructive">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Info className="h-5 w-5"/>Order Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
                <p><strong>Reason:</strong> {order.cancellationReason}
                 {order.cancelledBy === 'store' && " (By Store)"}
                 {order.cancelledBy === 'user' && " (By User)"}
                </p>
            </CardContent>
        </Card>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-border/60">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-primary"/>Ordered Items ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {items.map((item, index) => (
                        <div key={item.id + (item.selectedSize || '') + (item.selectedColor || '') + index}>
                            <div className="flex items-start gap-4 py-4">
                                <Image 
                                    src={item.imageUrl || 'https://placehold.co/80x100.png'} 
                                    alt={item.name}
                                    width={80}
                                    height={100}
                                    className="rounded-md object-cover aspect-[4/5]"
                                    data-ai-hint="product clothing"
                                />
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground">SKU: {item.sku || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">Size: {item.selectedSize} {item.selectedColor && `| Color: ${item.selectedColor}`}</p>
                                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                </div>
                                <p className="text-md font-semibold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            {index < items.length - 1 && <Separator />}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card className="shadow-lg border-border/60">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><BadgeIndianRupee className="h-6 w-6 text-primary"/>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>₹{order.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Shipping:</span> <span>₹{order.shippingCost.toFixed(2)}</span></div>
                    {order.discount && order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span> <span>-₹{order.discount.toFixed(2)}</span></div>}
                    <Separator className="my-2"/>
                    <div className="flex justify-between font-bold text-lg"><span>Grand Total:</span> <span>₹{order.grandTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-muted-foreground">Method:</span> 
                        <span className="font-medium flex items-center gap-1">
                           <CreditCard className="h-4 w-4 text-muted-foreground"/> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                        </span>
                    </div>
                </CardContent>
            </Card>

             <Card className="shadow-lg border-border/60">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><User className="h-6 w-6 text-primary"/>Shipping To</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p><strong>{shippingAddress.fullName}</strong></p>
                    <p><a href={`mailto:${shippingAddress.email}`} className="text-primary hover:underline">{shippingAddress.email}</a></p>
                    {shippingAddress.phoneNumber && <p><a href={`tel:${shippingAddress.phoneNumber}`} className="text-primary hover:underline">{shippingAddress.phoneNumber}</a></p>}
                    <Separator className="my-3"/>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
                        <div>
                            <p>{shippingAddress.addressLine1}</p>
                            {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                            <p>{shippingAddress.city}, {shippingAddress.stateProvince} {shippingAddress.postalCode}</p>
                            <p>{shippingAddress.country}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="shadow-lg border-border/60">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">Order Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p><strong>Placed On:</strong> {order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'N/A'}</p>
                     <Button variant="outline" className="w-full" onClick={() => setIsTrackingModalOpen(true)} disabled={order.status === 'Cancelled'}>
                        <TruckIcon className="mr-2 h-4 w-4" /> View Tracking
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setIsInvoiceModalOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" /> View Invoice
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleRequestCancellation}
                        disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
                    >
                        <XCircle className="mr-2 h-4 w-4" /> Request Cancellation
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>

    {order && <OrderTrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} order={order} />}
    {order && <InvoiceViewModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} order={order} />}
    
    {orderToCancel && (orderToCancel.status === 'Pending' || orderToCancel.status === 'Processing') && (
        <AlertDialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Order Cancellation Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to request cancellation for Order #{orderToCancel.id}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOrderToCancel(null)}>Back</AlertDialogCancel>
              <AlertDialogAction onClick={proceedToCancellationForm} className="bg-destructive hover:bg-destructive/90">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {orderToCancel && (orderToCancel.status === 'Shipped' || orderToCancel.status === 'Delivered') && (
         <AlertDialog open={isShippedCancelInfoOpen} onOpenChange={(open) => { if(!open) setOrderToCancel(null); setIsShippedCancelInfoOpen(open);}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Order Already {orderToCancel.status}</AlertDialogTitle>
              <AlertDialogDescription>
                OH Sorry! Your order <span className="font-semibold text-primary">#{orderToCancel.id}</span> is already {orderToCancel.status.toLowerCase()}.
                Still want to cancel? Please contact us now.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-4">
               <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={`tel:+919391157177`}>
                  <Phone className="mr-2 h-4 w-4" /> Call Us
                </a>
              </Button>
              <Button asChild className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white">
                <a href={getWhatsAppCancellationLink(orderToCancel.id)} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Us
                </a>
              </Button>
              <AlertDialogCancel onClick={() => setOrderToCancel(null)} className="w-full sm:w-auto mt-2 sm:mt-0">Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {orderToCancel && isCancelFormOpen && (
        <OrderCancellationFormModal
          isOpen={isCancelFormOpen}
          onClose={() => {
            setIsCancelFormOpen(false);
            setOrderToCancel(null);
          }}
          order={orderToCancel}
        />
      )}
    </div>
  );
}


    