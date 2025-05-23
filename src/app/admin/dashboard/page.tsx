
// @/app/admin/dashboard/page.tsx
"use client"; 

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingBag, Users, Settings, ArrowLeft, BarChart3, MessageSquare, Palette, ListOrdered, UsersRound, LayoutDashboard, PackageSearch, Undo2, UserCog, CreditCard, Truck, ServerCrash, Ticket, KeyRound } from 'lucide-react';
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
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { cn } from '@/lib/utils';


export default function AdminDashboardPage() {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  // const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false); // Managed by GlobalAdminNotifications
  // const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Managed by GlobalAdminNotifications

  useEffect(() => {
    // This effect is now only for the badge count, modal is global
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("status", "==", "Pending"));

    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
      const count = querySnapshot.size;
      setPendingOrdersCount(count);
    }, (error) => {
      console.error("Error fetching pending orders for badge: ", error);
    });

    return () => unsubscribe();
  }, []);


  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
         <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Site
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Oversee and manage all aspects of your Mens Club Keshavapatnam store. 
              New order notifications will appear globally.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Product Management</CardTitle>
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Add new products, view, edit, or remove them from your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/admin/products/add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
              </Link>
            </Button>
             <Button asChild variant="outline" className="w-full">
                <Link href="/admin/products/view">
                    <PackageSearch className="mr-2 h-5 w-5" /> View All Products
                </Link>
             </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
             <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Order Management</CardTitle>
              <div className="relative">
                <ListOrdered className="h-8 w-8 text-primary"/>
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                    {pendingOrdersCount}
                  </span>
                )}
              </div>
            </div>
            <CardDescription>View and process customer orders, manage shipping and returns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="default" className="w-full">
              <Link href="/admin/orders">
                View Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/orders/returns">
                 <Undo2 className="mr-2 h-5 w-5" /> Process Returns
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">User Management</CardTitle>
              <UsersRound className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Manage customer accounts, roles, and permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/users/view">
                 <Users className="mr-2 h-5 w-5" /> View Users
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/users/roles">
                <UserCog className="mr-2 h-5 w-5" /> Manage Roles
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Coupon Management</CardTitle>
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Create, view, edit, or delete discount coupons for your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/admin/coupons/add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Coupon
              </Link>
            </Button>
             <Button asChild variant="outline" className="w-full">
                <Link href="/admin/coupons">
                     View Coupons
                </Link>
             </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Analytics & Reports</CardTitle>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>View sales reports, customer insights, and store performance analytics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/analytics/sales">
                View Sales Analytics
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/analytics/customers">
                Customer Reports
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Customer Interactions</CardTitle>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Moderate product reviews and manage customer inquiries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full">
               <Link href="/admin/interactions/reviews">
                Manage Reviews
               </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
               <Link href="/admin/interactions/inquiries">
                 View Inquiries
               </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Store Settings</CardTitle>
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Configure payment gateways, shipping options, theme and admin account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <Button asChild variant="outline" className="w-full">
                <Link href="/admin/settings/theme">
                    <Palette className="mr-2 h-5 w-5" /> Theme Customization
                </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
                <Link href="/admin/settings/payments">
                    <CreditCard className="mr-2 h-5 w-5" /> Payment Settings
                </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
                 <Link href="/admin/settings/shipping">
                    <Truck className="mr-2 h-5 w-5" /> Shipping Configuration
                 </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
                 <Link href="/admin/settings/change-password">
                    <KeyRound className="mr-2 h-5 w-5" /> Change Admin Password
                 </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold text-destructive">Store Maintenance</CardTitle>
              <ServerCrash className="h-8 w-8 text-destructive" />
            </div>
            <CardDescription className="text-destructive/90">Perform critical store maintenance tasks. Use with caution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <Button asChild variant="destructive" className="w-full">
                <Link href="/admin/settings/reset-store">
                     Reset Store Data
                </Link>
            </Button>
          </CardContent>
        </Card>

      </div>
      {/* Modal is now handled by GlobalAdminNotifications */}
    </div>
  );
}

