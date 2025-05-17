// @/app/profile/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, LogOut, Edit3, Trash2, Loader2, Settings, ArrowLeft, MapPin, KeyRound } from 'lucide-react'; // Added KeyRound
import { Separator } from '@/components/ui/separator';
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
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, deleteUser, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import type { UserData } from '@/types';


export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true); 
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const fetchedUserData = userDocSnap.data() as UserData;
            if (fetchedUserData.role === 'admin') {
              router.replace('/admin/dashboard'); 
              return; 
            } else {
              setUserData({ uid: user.uid, ...fetchedUserData });
            }
          } else {
            setUserData({
              uid: user.uid,
              email: user.email || "N/A",
              fullName: user.displayName || "User",
              role: "user",
              memberSince: user.metadata.creationTime || new Date().toISOString(),
            });
            console.warn("User document not found in Firestore for UID:", user.uid);
          }
        } catch (error) {
          console.error("Error fetching user data for profile:", error);
          toast({ title: "Profile Load Error", description: "Could not load your profile details.", variant: "destructive" });
          setUserData({
            uid: user.uid,
            email: user.email || "N/A",
            fullName: user.displayName || "User",
            role: "user",
            memberSince: user.metadata.creationTime || new Date().toISOString(),
          });
        }
      } else {
        router.replace('/login?redirect=/profile');
        return;
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setCurrentUser(null);
      setUserData(null);
      router.push('/login'); 
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      toast({ title: "Error", description: "No user is currently logged in.", variant: "destructive" });
      return;
    }
    setIsDeletingAccount(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await deleteDoc(userDocRef); 
      
      await deleteUser(currentUser); 
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      router.push('/signup'); 
    } catch (error: any) {
      console.error("Error deleting account:", error);
      let description = error.message || "Could not delete your account. Please try again.";
      if (error.code === 'auth/requires-recent-login') {
        description = "This operation is sensitive and requires recent authentication. Please log out and log back in to delete your account.";
      }
      toast({
        title: "Account Deletion Failed",
        description: description,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isLoading || !userData) { 
    return (
      <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  
  if (userData.role === 'admin') {
    return (
        <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
            <p className="text-lg text-muted-foreground">Redirecting to admin dashboard...</p>
            <Loader2 className="h-8 w-8 animate-spin text-primary mt-4 mx-auto" />
        </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
      <Card className="shadow-xl border border-border/60">
        <CardHeader className="pb-6 text-center sm:text-left">
           <div className="flex flex-col items-center sm:items-start gap-2">
            <CardTitle className="text-3xl font-bold text-foreground">{userData.fullName || 'User Profile'}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{userData.email}</CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              Member since: {userData.memberSince ? new Date(userData.memberSince).toLocaleDateString() : 'N/A'}
            </p>
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
              <Link href="/checkout"> 
                <MapPin className="mr-3 h-5 w-5" /> Manage Address
              </Link>
            </Button>
             <Button variant="outline" asChild className="justify-start text-base py-6 h-auto">
              <Link href="/cart">
                <ShoppingCart className="mr-3 h-5 w-5" /> My Cart
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start text-base py-6 h-auto">
              <Link href="/profile/change-password"> 
                <KeyRound className="mr-3 h-5 w-5" /> Change Password
              </Link>
            </Button>
          </div>

          <Separator className="my-8" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button variant="default" onClick={handleLogout} className="w-full sm:w-auto text-base py-3 h-auto">
              <LogOut className="mr-2 h-5 w-5" /> Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto text-base py-3 h-auto" disabled={isDeletingAccount}>
                  {isDeletingAccount ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Trash2 className="mr-2 h-5 w-5" />} 
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers. This action might require you to sign in again for security reasons.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeletingAccount(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90" disabled={isDeletingAccount}>
                    {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, delete account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
