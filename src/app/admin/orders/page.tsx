
// @/app/admin/orders/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
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
import { ArrowLeft, Eye, ListOrdered, Loader2, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import type { Order } from '@/types';
import { collection, getDocs, query, orderBy as firestoreOrderBy, Timestamp, writeBatch, doc, deleteDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { InvoiceViewModal } from '@/components/orders/InvoiceViewModal';

export default function ViewOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // State for bulk delete
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ordersCol = collection(db, "orders");
        // Orders are fetched sorted by creation date, newest first.
        const q = query(ordersCol, firestoreOrderBy("createdAt", "desc"));
        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
          } as Order;
        });
        setOrders(orderList);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again.");
        toast({
          title: "Error",
          description: "Could not load orders from the database.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const handleViewInvoice = (order: Order) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders(prevSelected =>
      checked ? [...prevSelected, orderId] : prevSelected.filter(id => id !== orderId)
    );
  };

  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id!));
    } else {
      setSelectedOrders([]);
    }
  };

  const isAllSelected = useMemo(() => {
    if (orders.length === 0) return false;
    return selectedOrders.length === orders.length;
  }, [selectedOrders, orders]);

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;
    setIsDeletingSelected(true);
    try {
      const batch = writeBatch(db);
      selectedOrders.forEach(orderId => {
        batch.delete(doc(db, "orders", orderId));
      });
      await batch.commit();

      setOrders(prevOrders => prevOrders.filter(order => !selectedOrders.includes(order.id!)));
      setSelectedOrders([]);
      toast({
        title: "Orders Deleted",
        description: `${selectedOrders.length} order(s) have been permanently deleted.`,
      });
    } catch (err) {
      console.error("Error deleting selected orders:", err);
      toast({
        title: "Deletion Failed",
        description: "Could not delete selected orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSelected(false);
      setShowDeleteConfirm(false);
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
              <ListOrdered className="h-10 w-10 text-primary" />
              <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Manage Orders</h1>
                  <p className="mt-1 text-md text-muted-foreground">View and manage all customer orders. Sorted by newest first.</p>
              </div>
          </div>
           {selectedOrders.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeletingSelected}
              size="sm"
            >
              {isDeletingSelected ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Selected ({selectedOrders.length})
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
          <CardDescription>A list of all orders placed in your store. Orders are displayed newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <ListOrdered className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                       <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAllOrders(Boolean(checked))}
                        aria-label="Select all orders"
                      />
                    </TableHead>
                    <TableHead className="min-w-[180px]">Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer Email</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center w-[130px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} data-state={selectedOrders.includes(order.id!) ? "selected" : ""}>
                       <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id!)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id!, Boolean(checked))}
                          aria-label={`Select order ${order.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/admin/orders/view/${order.id}`} className="hover:underline text-primary break-all">
                            {order.id || 'N/A'}
                        </Link>
                      </TableCell>
                      <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'PPp') : 'N/A'}</TableCell>
                      <TableCell>{order.customerEmail || 'N/A'}</TableCell>
                      <TableCell className="text-right">{order.grandTotal?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                          ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : ''}
                          ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                          ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {order.status || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" asChild className="h-8 w-8">
                            <Link href={`/admin/orders/view/${order.id}`} title="View Order Details">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                           <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewInvoice(order)} title="View Invoice">
                              <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
         {orders.length > 0 && (
          <CardFooter className="justify-end">
            <p className="text-sm text-muted-foreground">
              {selectedOrders.length} order(s) selected.
            </p>
          </CardFooter>
        )}
      </Card>
      {selectedOrderForInvoice && (
        <InvoiceViewModal 
            isOpen={isInvoiceModalOpen} 
            onClose={() => { setIsInvoiceModalOpen(false); setSelectedOrderForInvoice(null);}} 
            order={selectedOrderForInvoice} 
        />
      )}
      {showDeleteConfirm && (
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {selectedOrders.length} selected order(s) from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSelected}
                disabled={isDeletingSelected}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletingSelected && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete selected orders
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    