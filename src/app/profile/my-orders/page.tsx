// @/app/profile/my-orders/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ArrowLeft, FileText, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { auth, db } from '@/lib/firebase'; // Assuming you might fetch orders from here later
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // For future order fetching
import type { User } from 'firebase/auth';

// Define a type for your order structure if not already in types/index.ts
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  // add other item properties like productId, imageUrl etc.
}

interface Order {
  id: string;
  date: string; // Or Date object, then format for display
  total: number;
  status: string;
  items: OrderItem[];
  // Add other order properties like userId, shippingAddress etc.
}


export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        // TODO: Fetch actual orders for this user from Firestore
        // For now, it will remain an empty array, showing "No Orders Yet"
        // Example of how you might fetch orders in the future:
        /*
        const fetchOrders = async (userId: string) => {
          try {
            const ordersRef = collection(db, "orders");
            // Query orders for the current user, ordered by date
            const q = query(ordersRef, where("userId", "==", userId), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedOrders = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Order));
            setOrders(fetchedOrders);
          } catch (error) {
            console.error("Error fetching orders: ", error);
            // Handle error, maybe show a toast
          } finally {
            setIsLoading(false);
          }
        };
        fetchOrders(user.uid);
        */
        setIsLoading(false); // Remove this if/when actual fetching is implemented
      } else {
        setCurrentUser(null);
        setIsLoading(false);
        // Optionally redirect to login if no user
        // router.push('/login');
      }
    });
    return () => unsubscribe();
  }, []);


  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <Link href="/profile" className="text-sm text-primary hover:underline flex items-center mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
        </Link>
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
                  <CardTitle className="text-xl font-semibold">Order {order.id}</CardTitle>
                  <CardDescription className="text-sm">
                    Placed on: {new Date(order.date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:items-end gap-1 sm:gap-0">
                   <span 
                    className={`px-3 py-1 text-xs font-medium rounded-full
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                      ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : ''}
                      ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : ''}
                    `}
                  >
                    {order.status}
                  </span>
                  <p className="text-lg font-bold text-primary mt-1 sm:mt-0">₹{order.total.toFixed(2)}</p>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 pb-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Items:</h4>
                <ul className="space-y-1 text-sm">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4 flex flex-col sm:flex-row gap-2 justify-end">
                <Button variant="outline" size="sm" disabled> {/* Disabled until invoice generation exists */}
                  <FileText className="mr-2 h-4 w-4" /> View Invoice
                </Button>
                <Button size="sm" disabled> {/* Disabled until tracking exists */}
                  <Package className="mr-2 h-4 w-4" /> Track Order
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {/* Pagination (Placeholder if many orders) */}
       {orders.length > 5 && ( // Placeholder, actual pagination logic would be needed
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline">1</Button>
            {/* Add more page numbers as needed */}
            <Button variant="outline" disabled>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
