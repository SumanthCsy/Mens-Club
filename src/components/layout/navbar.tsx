
// @/components/layout/navbar.tsx
"use client";

import Link from 'next/link';
import { ShoppingCart, User, Menu, Home, Store, LogIn, UserPlus, Shirt, LogOut, Shield, Loader2, Heart } from 'lucide-react'; // Added Heart
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserData } from '@/types';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context'; // Import useWishlist

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Products', icon: Store },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist(); // Get wishlistCount
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingAuth(true);
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUserData(userDocSnap.data() as UserData);
        } else {
          if (user.email === 'admin@mensclub') {
            setCurrentUserData({
              uid: user.uid,
              email: user.email,
              fullName: 'Admin Mens Club',
              role: 'admin',
              memberSince: user.metadata.creationTime || new Date().toISOString(),
            });
          } else {
             setCurrentUserData({
              uid: user.uid,
              email: user.email || 'N/A',
              fullName: user.displayName || 'User',
              role: 'user',
              memberSince: user.metadata.creationTime || new Date().toISOString(),
            });
            console.warn("User document not found in Firestore for UID:", user.uid);
          }
        }
      } else {
        setCurrentUser(null);
        setCurrentUserData(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setCurrentUser(null);
      setCurrentUserData(null);
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const accountLinksLoggedInBase = [
    {
      href: '/wishlist', // Add wishlist link
      label: 'Wishlist',
      icon: Heart,
    }
  ];
  
  const accountLinksLoggedIn = [
    ...accountLinksLoggedInBase,
    {
      href: currentUserData?.role === 'admin' ? '/admin/dashboard' : '/profile',
      label: currentUserData?.role === 'admin' ? 'Admin Dashboard' : 'Profile',
      icon: currentUserData?.role === 'admin' ? Shield : User
    },
    { onClick: handleLogout, label: 'Logout', icon: LogOut, isButton: true },
  ];

  const accountLinksLoggedOut = [
    { href: '/login', label: 'Login', icon: LogIn },
    { href: '/signup', label: 'Sign Up', icon: UserPlus },
  ];

  if (isLoadingAuth) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
           <Link href="/" className="flex items-center space-x-2 mr-2 xxs:mr-1 xs:mr-2 sm:mr-4 md:mr-6">
            <Shirt className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="font-bold text-lg xxs:text-xl xs:text-xl sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              Mens Club
            </span>
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-2 xxs:mr-1 xs:mr-2 sm:mr-4 md:mr-6">
          <Shirt className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <span className="font-bold text-lg xxs:text-xl xs:text-xl sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
            Mens Club
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary font-semibold' : 'text-foreground/70'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          <Link href="/wishlist" passHref>
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative h-8 w-8 xxs:h-9 xxs:w-9 xs:h-9 xs:w-9 sm:h-10 sm:w-10">
              <Heart className="h-4 w-4 xxs:h-5 xxs:w-5 xs:h-5 xs:w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative h-8 w-8 xxs:h-9 xxs:w-9 xs:h-9 xs:w-9 sm:h-10 sm:w-10">
              <ShoppingCart className="h-4 w-4 xxs:h-5 xxs:w-5 xs:h-5 xs:w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            {currentUser && currentUserData ? (
              <>
                <Button variant="ghost" size="icon" asChild aria-label={currentUserData.role === 'admin' ? 'Admin Dashboard' : 'Profile'}>
                  <Link href={currentUserData.role === 'admin' ? '/admin/dashboard' : '/profile'}>
                    {currentUserData.role === 'admin' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open Menu" className="h-8 w-8 xxs:h-9 xxs:w-9 xs:h-9 xs:w-9 sm:h-10 sm:w-10">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
             <SheetClose asChild>
              <div className="p-6">
                <Link href="/" className="flex items-center space-x-2 mb-6">
                  <Shirt className="h-7 w-7 text-primary" />
                  <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                    Mens Club
                  </span>
                </Link>
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={`mobile-${link.href}`}>
                      <Link
                        href={link.href}
                        className={cn(
                          'flex items-center space-x-3 rounded-md p-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground',
                          pathname === link.href ? 'bg-accent text-accent-foreground font-semibold' : 'text-foreground/80'
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                  <hr className="my-3 border-border"/>
                  {(currentUser && currentUserData ? accountLinksLoggedIn : accountLinksLoggedOut).map((link) => (
                    link.isButton ? (
                       <SheetClose asChild key={`mobile-action-${link.label}`}>
                        <Button
                            variant="ghost"
                            onClick={link.onClick}
                            className={cn(
                                'flex items-center space-x-3 rounded-md p-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground justify-start w-full',
                                'text-foreground/80'
                            )}
                        >
                            <link.icon className="h-5 w-5" />
                            <span>{link.label}</span>
                        </Button>
                       </SheetClose>
                    ) : (
                    <SheetClose asChild key={`mobile-auth-${link.href}`}>
                      <Link
                        href={link.href!} 
                        className={cn(
                          'flex items-center space-x-3 rounded-md p-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground',
                          pathname === link.href ? 'bg-accent text-accent-foreground font-semibold' : 'text-foreground/80'
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
                    )
                  ))}
                </nav>
              </div>
             </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
