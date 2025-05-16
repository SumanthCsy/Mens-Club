
// @/app/admin/users/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, AlertTriangle, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserData } from '@/types';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';

export default function AdminEditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const fetchedData = { uid: userSnap.id, ...userSnap.data() } as UserData;
            setOriginalUserData(fetchedData);
            setUserData({
              fullName: fetchedData.fullName || '',
              email: fetchedData.email || '',
              mobileNumber: fetchedData.mobileNumber || '',
              role: fetchedData.role || 'user',
            });
          } else {
            setError("User not found.");
            toast({ title: "Error", description: "User not found.", variant: "destructive" });
          }
        } catch (err) {
          console.error("Error fetching user:", err);
          setError("Failed to fetch user details.");
          toast({ title: "Error", description: "Failed to load user details.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    } else {
      setError("No user ID provided.");
      setIsLoading(false);
    }
  }, [userId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (newRole: UserData['role']) => {
    setUserData(prev => ({ ...prev, role: newRole }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!originalUserData) {
        toast({ title: "Error", description: "Original user data not loaded.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);

    const dataToUpdate: Partial<UserData> = {
      fullName: userData.fullName || originalUserData.fullName,
      // Email is typically not changed directly here, handle with care if needed
      // email: userData.email || originalUserData.email,
      mobileNumber: userData.mobileNumber || originalUserData.mobileNumber,
      role: userData.role || originalUserData.role,
    };

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, dataToUpdate);
      toast({
        title: "User Updated!",
        description: `${dataToUpdate.fullName}'s details have been successfully updated.`,
      });
      router.push('/admin/users/view');
    } catch (error) {
      console.error("Error updating user document: ", error);
      toast({
        title: "Error Updating User",
        description: "There was an issue updating the user. Check console.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading user details for editing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/users/view">Back to Users</Link>
        </Button>
      </div>
    );
  }
  
  if (!originalUserData) {
     return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">User data could not be loaded.</p>
         <Button asChild className="mt-4">
          <Link href="/admin/users/view">Back to Users</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/users/view">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to View Users
          </Link>
        </Button>
         <div className="flex items-center gap-3">
            <UserCog className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Edit User</h1>
                <p className="mt-1 text-md text-muted-foreground">
                  Modify details for: {originalUserData.fullName || originalUserData.email}
                </p>
            </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Update the user's details below. Email cannot be changed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                value={userData.fullName || ''} 
                onChange={handleChange} 
                placeholder="User's full name" 
                required 
                className="text-base h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Read-only)</Label>
              <Input 
                id="email" 
                name="email" 
                value={userData.email || ''} 
                readOnly 
                className="text-base h-11 bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input 
                id="mobileNumber" 
                name="mobileNumber" 
                type="tel"
                value={userData.mobileNumber || ''} 
                onChange={handleChange} 
                placeholder="User's mobile number" 
                className="text-base h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={userData.role || 'user'} 
                onValueChange={(value) => handleRoleChange(value as UserData['role'])}
              >
                <SelectTrigger className="w-full h-11 text-base">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="text-base" disabled={isSubmitting || isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating...
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
      <p className="mt-4 text-xs text-center text-muted-foreground">
        Note: Changing a user's role to 'admin' grants them full administrative privileges.
        Email addresses cannot be changed from this interface.
      </p>
    </div>
  );
}
