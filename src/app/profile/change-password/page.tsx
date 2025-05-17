// @/app/profile/change-password/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, KeyRound, Save, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, type User as FirebaseUser } from 'firebase/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("No authenticated user found or user email is missing.");
      toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
      router.push('/login?redirect=/profile/change-password');
      return;
    }

    setIsLoading(true);

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // If re-authentication is successful, update the password
      await updatePassword(user, newPassword);

      toast({
        title: "Password Updated Successfully!",
        description: "Your password has been changed.",
      });
      router.push('/profile');

    } catch (err: any) {
      console.error("Error changing password:", err);
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

  if (!auth.currentUser && !isLoading) { // Check if user is logged out while not initially loading
    // This can happen if the page is accessed directly without being logged in
    // or if auth state changes during page load.
     return (
      <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">You need to be logged in to change your password.</p>
        <Button asChild>
          <Link href="/login?redirect=/profile/change-password">Login</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <KeyRound className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Change Password</h1>
            <p className="mt-1 text-md text-muted-foreground">Update your account password.</p>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter your current password, then choose and confirm your new password. 
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
                placeholder="Enter your current password"
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
