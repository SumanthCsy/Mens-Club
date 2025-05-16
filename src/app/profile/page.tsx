
// @/app/profile/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShoppingCart, Package, LogOut, Edit3 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Placeholder for generic user display data.
// In a real app, this would be fetched based on the logged-in user's ID.
const placeholderUserData = {
  name: "Mens Club User",
  email: "user@example.com", // This email is just for display, not for logic
  avatarUrl: "https://placehold.co/100x100.png",
  memberSince: "2024-01-01", // Example date
};


export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setCurrentUserRole(role);
    setIsLoading(false);

    if (!role) {
      // Not logged in, redirect to login
      router.replace('/login');
    } else if (role === 'admin') {
      // Admin logged in, redirect to admin dashboard
      router.replace('/admin/dashboard');
    }
    // If role === 'user', this component will render the profile UI
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setCurrentUserRole(null); // Update state
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login'); 
  };

  if (isLoading || !currentUserRole || currentUserRole === 'admin') {
    // Show loading indicator or nothing if redirecting or not a 'user'
    return (
      <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <p>Loading profile or redirecting...</p>
        {/* Optionally, add a spinner here */}
      </div>
    );
  }
  
  // At this point, currentUserRole must be 'user'.
  // We use placeholderUserData for display structure.
  // In a real app, you'd fetch actual user data.
  const displayUserData = placeholderUserData; 

  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Card className="shadow-xl border border-border/60">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={displayUserData.avatarUrl} alt={displayUserData.name} data-ai-hint="person avatar"/>
              <AvatarFallback className="text-3xl">
                {displayUserData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">{displayUserData.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">{displayUserData.email}</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">Member since: {new Date(displayUserData.memberSince).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        
        <Separator />

        <CardContent className="pt-6 space-y-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Account Management</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" asChild className="justify-start text-base py-6 h-auto">
              <Link href="/profile/edit"> {/* This page would need to be created */}
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
