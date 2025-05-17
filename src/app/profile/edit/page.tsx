// @/app/profile/edit/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, UserCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserData } from '@/types';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [formData, setFormData] = useState<Partial<Pick<UserData, 'fullName' | 'email' | 'mobileNumber'>>>({
    fullName: '',
    email: '',
    mobileNumber: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData;
            setFormData({
              fullName: userData.fullName || '',
              email: userData.email || '', // Should always exist from auth
              mobileNumber: userData.mobileNumber || '',
            });
          } else {
            setError("User profile data not found.");
            // Set form data from auth as fallback
            setFormData({
                fullName: user.displayName || '',
                email: user.email || '',
                mobileNumber: user.phoneNumber || ''
            })
          }
        } catch (err) {
          console.error("Error fetching user data for edit:", err);
          setError("Failed to load profile data.");
           setFormData({
                fullName: user.displayName || '',
                email: user.email || '',
                mobileNumber: user.phoneNumber || ''
            })
        }
      } else {
        router.replace('/login?redirect=/profile/edit');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Error", description: "No user logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const dataToUpdate: Partial<Pick<UserData, 'fullName' | 'mobileNumber'>> = {
      fullName: formData.fullName?.trim(),
      mobileNumber: formData.mobileNumber?.trim(),
    };
    // Remove undefined fields
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);


    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, dataToUpdate);
      toast({
        title: "Profile Updated!",
        description: "Your profile details have been successfully updated.",
      });
      router.push('/profile');
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading profile for editing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/profile">Back to Profile</Link>
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
          <UserCircle className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Edit Your Profile</h1>
            <p className="mt-1 text-md text-muted-foreground">Update your personal information.</p>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Make changes to your name and mobile number. Email cannot be changed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Read-only)</Label>
              <Input
                id="email"
                name="email"
                value={formData.email || ''}
                readOnly
                disabled
                className="text-base h-11 bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber || ''}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className="text-base h-11"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Save Changes
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
