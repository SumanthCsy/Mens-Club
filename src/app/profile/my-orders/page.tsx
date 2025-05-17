
// @/app/profile/my-orders/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ArrowLeft, FileText, ShoppingBag, Loader2, AlertTriangle, TruckIcon } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy as firestoreOrderBy, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Order, OrderItem } from '@/types'; 
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePdf } from '@/lib/invoice-generator';
import { OrderTrackingModal } from '@/components/orders/OrderTrackingModal';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
        // Optionally redirect to login if no user
        // router.push('/login?redirect=/profile/my-orders');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchOrders = async (userId: string) => {
        setIsLoading(true);
        try {
          const ordersRef = collection(db, "orders");
          const q = query(
            ordersRef,
            where("userId", "==", userId),
            firestoreOrderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const fetchedOrders = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            } as Order;
          });
          setOrders(fetchedOrders);
        } catch (error: any) {
          console.error("Error fetching orders: ", error);
          let description = "Could not load your orders. Please try again.";
          if (error.message && error.message.includes("firestore/indexes?create_composite")) {
            description = "Orders cannot be loaded. A database index is required. Please contact support or check console for a link to create it.";
             toast({
              title: "Database Index Required",
              description: "A required database index is missing. Please check the developer console for a link to create it in Firebase, or contact support.",
              variant: "destructive",
              duration: 15000,
            });
          } else {
            toast({
              title: "Error Fetching Orders",
              description: description,
              variant: "destructive"
            });
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders(currentUser.uid);
    } else {
        setIsLoading(false);
        setOrders([]);
    }
  }, [currentUser, toast]);

  const handleViewInvoice = (order: Order) => {
    generateInvoicePdf(order);
  };
  
  const openTrackingModal = (order: Order) => {
    setSelectedOrderForTracking(order);
  };

  const closeTrackingModal = () => {
    setSelectedOrderForTracking(null);
  };


  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (!currentUser) {
     return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">Please log in to view your orders.</p>
        <Button asChild>
          <Link href="/login?redirect=/profile/my-orders">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/profile">
             <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
          </Link>
        </Button>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">My Orders</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Track your past and current orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-16 shadow-md border border-border/60">
          <CardHeader>
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl font-semibold">No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders with us. Start shopping to see your orders here!
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild size="lg">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-5 w-5" /> Continue Shopping
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200 border border-border/60">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4">
                <div>
                  <CardTitle className="text-xl font-semibold">Order #{order.id?.substring(0, 8)}...</CardTitle>
                  <CardDescription className="text-sm">
                    Placed on: {order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'N/A'}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:items-end gap-1 sm:gap-0">
                   <span 
                    className={`px-3 py-1 text-xs font-medium rounded-full
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                      ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : ''}
                      ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                      ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : ''}
                    `}
                  >
                    {order.status}
                  </span>
                  <p className="text-lg font-bold text-primary mt-1 sm:mt-0">₹{order.grandTotal.toFixed(2)}</p>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 pb-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Items ({order.items.length}):</h4>
                <ul className="space-y-1 text-sm">
                  {order.items.map((item, index) => (
                    <li key={item.id + (item.selectedSize || '') + (item.selectedColor || '') + index} className="flex justify-between">
                      <span>{item.name} (Size: {item.selectedSize || 'N/A'}, Qty: {item.quantity})</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4 flex flex-col sm:flex-row gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => handleViewInvoice(order)}>
                  <FileText className="mr-2 h-4 w-4" /> View Invoice (Simulated)
                </Button>
                <Button size="sm" onClick={() => openTrackingModal(order)} disabled={order.status === 'Cancelled'}>
                  <TruckIcon className="mr-2 h-4 w-4" /> Track Order
                </Button>
                 <Button variant="outline" size="sm" disabled className="border-destructive text-destructive hover:bg-destructive/10">
                   Request Cancellation (Soon)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {orders.length > 5 && (
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline">1</Button>
            <Button variant="outline" disabled>Next</Button>
          </div>
        </div>
      )}
      {selectedOrderForTracking && (
        <OrderTrackingModal
          isOpen={!!selectedOrderForTracking}
          onClose={closeTrackingModal}
          order={selectedOrderForTracking}
        />
      )}
    </div>
  );
}
