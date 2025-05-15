// @/app/profile/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShoppingCart, Package, LogOut, Edit3, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// This is a placeholder. In a real app, user data would come from an auth context/API.
const userData = {
  name: "Keshav Kumar",
  email: "keshav@example.com",
  avatarUrl: "https://placehold.co/100x100.png",
  memberSince: "2023-01-15",
  isAdmin: false, // Set to true to see admin link example
};


export default function ProfilePage() {
  // Placeholder for logout functionality
  const handleLogout = () => {
    console.log("Logout action triggered");
    // Add actual logout logic here (e.g., clear auth tokens, redirect)
  };

  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Card className="shadow-xl border border-border/60">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={userData.avatarUrl} alt={userData.name} data-ai-hint="person avatar"/>
              <AvatarFallback className="text-3xl">
                {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">{userData.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">{userData.email}</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">Member since: {new Date(userData.memberSince).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        
        <Separator />

        <CardContent className="pt-6 space-y-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Account Management</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" asChild className="justify-start text-base py-6 h-auto">
              <Link href="/profile/edit">
                <Edit3 className="mr-3 h-5 w-5" /> Edit Profile
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start text-base py-6 h-auto">
              <Link href="/profile/my-orders">
                <Package className="mr-3 h-5 w-5" /> My Orders
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start text-base py-6 h-auto">
              <Link href="/cart">
                <ShoppingCart className="mr-3 h-5 w-5" /> My Cart
              </Link>
            </Button>
            {userData.isAdmin && (
               <Button variant="outline" asChild className="justify-start text-base py-6 h-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800">
                <Link href="/admin/dashboard"> {/* Placeholder admin link */}
                  <Shield className="mr-3 h-5 w-5" /> Admin Panel
                </Link>
              </Button>
            )}
          </div>

          <Separator className="my-8" />
          
          <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto text-base py-3 h-auto">
            <LogOut className="mr-2 h-5 w-5" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
