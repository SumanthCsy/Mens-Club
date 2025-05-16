
// @/app/login/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Mail, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in (for better UX)
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      router.replace('/admin/dashboard');
    } else if (userRole === 'user') {
      router.replace('/profile');
    }
  }, [router]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (email === 'admin@mensclub' && password === 'admin@mensclub') {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', 'Mens Club Admin'); // Admin's name
        localStorage.setItem('userEmail', email);
        toast({
          title: "Admin Login Successful!",
          description: "Redirecting to the Admin Dashboard...",
        });
        router.push('/admin/dashboard'); 
      } else if (email && password) { // Simulate any other login as a regular user
        // Try to get name from localStorage (e.g., if they signed up before)
        // For simulation, if not found, use a generic name or part of the email.
        let userName = localStorage.getItem('userName');
        if (!userName || localStorage.getItem('userEmail') !== email) {
          // If email doesn't match stored email for userName, or userName isn't set
          userName = email.split('@')[0] || 'Valued User'; // Simple fallback
          localStorage.setItem('userName', userName);
        }
        
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('userEmail', email); // Store/update email on login
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userName}!`,
        });
        router.push('/'); 
      }
      else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again or sign up.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 500); 
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
                  <LogIn className="mr-2 h-5 w-5 animate-spin" /> Signing In...
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
