
// @/app/profile/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShoppingCart, Package, LogOut, Edit3, Trash2, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DisplayUserData {
  name: string;
  email: string;
  avatarUrl: string;
  memberSince: string; // Example date
}

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [displayUserData, setDisplayUserData] = useState<DisplayUserData>({
    name: "Loading...",
    email: "loading...",
    avatarUrl: "https://placehold.co/100x100.png",
    memberSince: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    
    setCurrentUserRole(role);

    if (!role) {
      router.replace('/login');
    } else if (role === 'admin') {
      router.replace('/admin/dashboard');
    } else if (role === 'user') {
      setDisplayUserData({
        name: name || "Valued User",
        email: email || "user@example.com",
        avatarUrl: "https://placehold.co/100x100.png", // Could be dynamic later
        memberSince: "2024-01-01", // Could also be stored/fetched
      });
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setCurrentUserRole(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login'); 
  };

  const handleDeleteAccount = () => {
    // Simulate account deletion
    console.log("Simulating account deletion for:", displayUserData.email);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // In a real app, here you would call Firebase to delete user Auth and Firestore data.
    toast({
      title: "Account Deleted (Simulated)",
      description: "Your account information has been removed from this browser.",
      variant: "default" 
    });
    setCurrentUserRole(null);
    router.push('/signup');
  };

  if (isLoading || !currentUserRole || currentUserRole !== 'user') {
    return (
      <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <p>Loading profile or redirecting...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Card className="shadow-xl border border-border/60">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={displayUserData.avatarUrl} alt={displayUserData.name} data-ai-hint="person avatar"/>
              <AvatarFallback className="text-3xl">
                {displayUserData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
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
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto text-base py-3 h-auto">
              <LogOut className="mr-2 h-5 w-5" /> Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto text-base py-3 h-auto border-destructive text-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-2 h-5 w-5" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers (simulated).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Account deletion is simulated and only removes data from local storage. Actual database deletion requires backend integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
