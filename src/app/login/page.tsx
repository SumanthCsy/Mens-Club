
// @/app/login/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Mail, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserData } from '@/types';


export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserData;
          if (userData.role === 'admin') {
            router.replace('/admin/dashboard');
          } else {
            router.replace('/'); 
          }
        } else {
           // Fallback if no user doc, e.g., admin only in Auth
           if (user.email === 'admin@mensclub') {
             router.replace('/admin/dashboard');
           } else {
            router.replace('/'); 
           }
        }
      }
    });
    return () => unsubscribe();
  }, [router]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userName = "User";
      let userRole = "user"; // Default to 'user'

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserData;
        userName = userData.fullName || user.email?.split('@')[0] || "User";
        userRole = userData.role || "user";
      } else {
        // If no user document in Firestore, but user authenticated successfully via Firebase Auth
        console.warn(`User document not found in Firestore for UID: ${user.uid}. Email: ${user.email}`);
        if (user.email === 'admin@mensclub') {
          // Fallback to assign admin role if email matches.
          // This is a safeguard; ideally, admin's Firestore doc should exist with role: 'admin'.
          userRole = 'admin';
          userName = 'Admin Mens Club'; 
          toast({
            title: "Admin Alert",
            description: "Admin Firestore document not found. Assigned admin role based on email. Please ensure Firestore 'users' collection is correctly set up for the admin.",
            variant: "destructive",
            duration: 10000, 
          });
        } else {
          // For regular users, if their Firestore doc is missing, they'll be treated as 'user' role
          // but might lack profile details like fullName.
          userRole = 'user'; 
          userName = user.email?.split('@')[0] || "User"; 
           toast({
            title: "Profile Data Missing",
            description: "Your user profile details could not be fully loaded. Some information may be missing.",
            variant: "default",
            duration: 7000,
          });
        }
      }
      
      if (userRole === 'admin' && email === 'admin@mensclub') { 
        toast({
          title: "Admin Login Successful!",
          description: "Redirecting to the Admin Dashboard...",
        });
        router.push('/admin/dashboard'); 
      } else if (userRole === 'user') { 
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userName}!`,
        });
        router.push('/'); 
      } else {
        // Fallback if role is neither 'admin' nor 'user'
        toast({
          title: "Login Successful (Role Undetermined)",
          description: `Welcome, ${userName}! Redirecting to homepage. Please check your account setup if full features are not available.`,
           variant: "default",
           duration: 7000,
        });
        router.push('/');
      }
    } catch (error: any) {
      console.error("Login error: ", error);
      // This is where "invalid auth credentials" error from Firebase will be caught and displayed
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please ensure your email and password are correct, or sign up if you are a new user.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full shadow-xl border border-border/60">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue to Mens Club.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  className="pl-10 h-11 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="pl-10 h-11 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full text-lg py-3 h-auto" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
