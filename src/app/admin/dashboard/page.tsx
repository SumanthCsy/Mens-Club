// @/app/admin/dashboard/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingBag, Users, Settings, ArrowLeft } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
         <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Link>
        </Button>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Manage your store's products, orders, and users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Product Management Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Product Management</CardTitle>
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Add, edit, or remove products from your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/products/add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
              </Link>
            </Button>
            {/* Future buttons: View All Products, etc. */}
          </CardContent>
        </Card>

        {/* Order Management Card (Placeholder) */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
             <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Order Management</CardTitle>
              <ShoppingBag className="h-8 w-8 text-primary" /> {/* Using ShoppingBag as a generic e-commerce icon */}
            </div>
            <CardDescription>View and process customer orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>View Orders (Coming Soon)</Button>
          </CardContent>
        </Card>

        {/* User Management Card (Placeholder) */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">User Management</CardTitle>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Manage customer accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>View Users (Coming Soon)</Button>
          </CardContent>
        </Card>
        
        {/* Settings Card (Placeholder) */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Store Settings</CardTitle>
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Configure general store settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>Go to Settings (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
