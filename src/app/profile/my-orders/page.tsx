
// @/app/profile/my-orders/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingBag, Loader2, AlertTriangle, Eye, ClipboardCopy, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy as firestoreOrderBy, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Order } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MyOrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
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

  const handleCopyOrderId = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent card click when copying
    e.preventDefault();
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      toast({
        title: "Order ID Copied!",
        description: `${orderId} copied to clipboard.`,
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

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (!currentUser && !isLoading) { // Adjusted to check isLoading too
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
          Review your order history. Click on an order to see full details.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-16 shadow-md border border-border/60">
          <CardHeader>
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl font-semibold">No Orders Yet</CardTitle>
          </CardHeader>
          <CardFooter className="justify-center pt-6">
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
            <Link key={order.id} href={`/profile/my-orders/${order.id}`} className="block group" passHref>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border border-border/60 hover:border-primary/50 cursor-pointer overflow-hidden">
                <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-base sm:text-lg font-semibold break-all leading-tight">
                        Order ID: {order.id || 'N/A'}
                      </CardTitle>
                      {order.id && (
                          <Button variant="ghost" size="icon" onClick={(e) => handleCopyOrderId(e, order.id!)} className="h-6 w-6 text-muted-foreground hover:text-primary">
                            <ClipboardCopy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                    </div>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground self-start sm:self-center pt-0.5 sm:pt-0">
                        Placed: {order.createdAt ? format(new Date(order.createdAt), 'dd MMM, yyyy') : 'N/A'}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                {order.items && order.items.length > 0 && (
                    <CardContent className="px-4 sm:px-5 py-3 border-t border-b border-border/40">
                        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                            {order.items.slice(0, 4).map((item, index) => ( // Show up to 4 item images
                                <div key={item.id + index} className="shrink-0">
                                    <Image
                                    src={item.imageUrl || 'https://placehold.co/60x80.png'}
                                    alt={item.name}
                                    width={48} // Slightly smaller images
                                    height={64}
                                    className="rounded-md object-cover aspect-[3/4] border border-border/30"
                                    data-ai-hint={item.sku || "clothing item"}
                                    />
                                </div>
                            ))}
                            {order.items.length > 4 && (
                                <div className="pl-1 text-xs text-muted-foreground self-end shrink-0">
                                    + {order.items.length - 4} more
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}

                <CardFooter className="pt-3 pb-4 px-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-col items-start">
                         <span
                            className={cn(`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                            ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : ''}
                            ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                            ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : ''}
                            `)}
                        >
                            {order.status}
                        </span>
                         <p className="text-sm text-muted-foreground mt-1.5">
                            Total: <span className="font-semibold text-foreground">₹{order.grandTotal.toFixed(2)}</span>
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-sm group-hover:bg-primary/5 group-hover:border-primary/70">
                        <Eye className="mr-1.5 h-4 w-4" /> View Order
                    </Button>
                </CardFooter>
              </Card>
            </Link>
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
    </div>
  );
}
