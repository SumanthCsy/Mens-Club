
// @/app/admin/orders/view/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, User, MapPin, CreditCard, Edit, Loader2, AlertTriangle, ShoppingCart, BadgeIndianRupee, FileText, TruckIcon } from 'lucide-react';
import type { Order, OrderItem, ShippingAddress } from '@/types';
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateInvoicePdf } from '@/lib/invoice-generator'; // Import the invoice function
import { OrderTrackingModal } from '@/components/orders/OrderTrackingModal'; // Import the tracking modal


export default function AdminViewOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const orderRef = doc(db, "orders", orderId);
          const orderSnap = await getDoc(orderRef);
          if (orderSnap.exists()) {
            const data = orderSnap.data();
            setOrder({
              id: orderSnap.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
            } as Order);
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
    } else {
        setError("No order ID provided.");
        setIsLoading(false);
    }
  }, [orderId, toast]);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order || !order.id) return;
    setIsUpdatingStatus(true);
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: newStatus });
      setOrder(prevOrder => prevOrder ? { ...prevOrder, status: newStatus } : null);
      toast({
        title: "Order Status Updated",
        description: `Order ${order.id.substring(0,8)} status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update order status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (order) {
      generateInvoicePdf(order);
    }
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
          <Link href="/admin/orders">Back to Orders</Link>
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
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const { shippingAddress, items } = order;

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Orders
          </Link>
        </Button>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
                <Package className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Order Details</h1>
                    <p className="mt-1 text-md text-muted-foreground">
                    Order ID: {order.id?.substring(0, 8)}...
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Select value={order.status} onValueChange={(value) => handleStatusChange(value as Order['status'])} disabled={isUpdatingStatus}>
                    <SelectTrigger className="w-[180px] h-10 text-base">
                        <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                 {isUpdatingStatus && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
        </div>
      </div>

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
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span> 
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                          ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : ''}
                          ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                          ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {order.status}
                        </span>
                    </div>
                </CardContent>
            </Card>

             <Card className="shadow-lg border-border/60">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><User className="h-6 w-6 text-primary"/>Customer & Shipping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p><strong>{shippingAddress.fullName}</strong></p>
                    <p><a href={`mailto:${order.customerEmail}`} className="text-primary hover:underline">{order.customerEmail}</a></p>
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
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Placed On:</strong> {order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'N/A'}</p>
                     <Button variant="outline" className="w-full" onClick={() => setIsTrackingModalOpen(true)}>
                        <TruckIcon className="mr-2 h-4 w-4" /> View Tracking
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleDownloadInvoice}>
                        <FileText className="mr-2 h-4 w-4" /> Download Invoice (Simulated)
                    </Button>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" disabled className="w-full"><Edit className="mr-2 h-4 w-4"/> Edit Order (Soon)</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
    <OrderTrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} order={order} />
    </div>
  );
}
