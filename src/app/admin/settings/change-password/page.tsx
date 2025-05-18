
// @/app/admin/settings/change-password/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, KeyRound, Save, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserData } from '@/types';

export default function AdminChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify if the current user is an admin from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserData;
          if (userData.role !== 'admin') {
            toast({ title: "Access Denied", description: "You are not authorized to access this page.", variant: "destructive" });
            router.replace('/'); // Redirect non-admins
            return;
          }
        } else {
          // If no user doc, but it's the hardcoded admin email, potentially allow (though less secure)
          // For stronger security, admin role must be in Firestore
          if (user.email !== 'admin@mensclub') {
            toast({ title: "Access Denied", description: "User profile not found or not an admin.", variant: "destructive" });
            router.replace('/');
            return;
          }
        }
      } else {
        // No user logged in
        toast({ title: "Authentication Required", description: "Please log in as admin.", variant: "destructive" });
        router.replace('/login');
        return;
      }
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      toast({ title: "Error", description: "New password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("No authenticated admin user found or user email is missing.");
      toast({ title: "Authentication Error", description: "Please log in again as admin.", variant: "destructive" });
      router.push('/login');
      return;
    }

    setIsLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: "Password Updated Successfully!",
        description: "Admin password has been changed.",
      });
      router.push('/admin/dashboard');

    } catch (err: any) {
      console.error("Error changing admin password:", err);
      let errorMessage = "Failed to change password. Please try again.";
      if (err.code === 'auth/wrong-password') {
        errorMessage = "Incorrect current password. Please try again.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "New password is too weak. It must be at least 6 characters.";
      } else if (err.code === 'auth/requires-recent-login') {
        errorMessage = "This operation is sensitive and requires recent authentication. Please log out and log back in before changing your password.";
      }
      setError(errorMessage);
      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <KeyRound className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Change Admin Password</h1>
            <p className="mt-1 text-md text-muted-foreground">Update your admin account password.</p>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter your current admin password, then choose and confirm your new password. 
            Your new password must be at least 6 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current admin password"
                required
                className="text-base h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                required
                className="text-base h-11"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                className="text-base h-11"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> {error}
              </p>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
