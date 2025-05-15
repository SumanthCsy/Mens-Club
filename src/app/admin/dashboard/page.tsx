// @/app/admin/dashboard/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingBag, Users, Settings, ArrowLeft, BarChart3, MessageSquare, Palette } from 'lucide-react';

export default function AdminDashboardPage() {
  // This page assumes an admin user is logged in.
  // Add role-based access control in a real application.

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
          Manage your store's products, orders, users, and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Product Management</CardTitle>
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Add, edit, or remove products from your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/admin/products/add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
              </Link>
            </Button>
             <Button variant="outline" className="w-full" disabled>View All Products (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
             <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Order Management</CardTitle>
              {/* Using a more distinct icon for orders */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <CardDescription>View and process customer orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>View Orders (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">User Management</CardTitle>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Manage customer accounts and roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>View Users (Coming Soon)</Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Analytics & Reports</CardTitle>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>View sales reports and store analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>View Analytics (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Customer Reviews</CardTitle>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Moderate and manage product reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>Manage Reviews (Coming Soon)</Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Store Settings</CardTitle>
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>Configure payment, shipping, and theme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <Button variant="outline" className="w-full" disabled>
                <Palette className="mr-2 h-5 w-5" /> Theme Customization (Soon)
            </Button>
            <Button variant="outline" className="w-full" disabled>General Settings (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
