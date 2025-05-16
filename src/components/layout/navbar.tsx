
// @/components/layout/navbar.tsx
"use client";

import Link from 'next/link';
import { ShoppingCart, User, Menu, Home, Store, LogIn, UserPlus, Shirt, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Products', icon: Store },
];

// Account links for when user is not logged in (used in mobile sheet)
const accountLinksLoggedOut = [
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/signup', label: 'Sign Up', icon: UserPlus },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [cartItemCount, setCartItemCount] = useState(0); // Default cart count to 0
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check login state from localStorage on mount
    const role = localStorage.getItem('userRole');
    if (role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }

    // Simulate cart item count update (replace with actual cart logic later)
    // For now, it remains 0 unless you add items to the cart via its own logic.
    // const currentCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    // setCartItemCount(currentCartItems.length);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
    // Consider router.refresh() if navbar state isn't updating fast enough
  };
  
  // Account links for when user is logged in (used in mobile sheet)
  const accountLinksLoggedIn = [
    { 
      href: userRole === 'admin' ? '/admin/dashboard' : '/profile', 
      label: userRole === 'admin' ? 'Admin Dashboard' : 'Profile', 
      icon: userRole === 'admin' ? Shield : User 
    },
    { onClick: handleLogout, label: 'Logout', icon: LogOut, isButton: true },
  ];


  if (!isMounted) {
    // Avoid rendering mismatched UI during hydration
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
           <Link href="/" className="flex items-center space-x-2 mr-2 sm:mr-4">
            <Shirt className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="font-bold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              Mens Club
            </span>
          </Link>
          {/* Placeholder for icons while loading */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-muted rounded-full animate-pulse"></div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-muted rounded-full animate-pulse hidden md:block"></div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-muted rounded-full animate-pulse md:hidden"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-2 sm:mr-4 md:mr-6">
          <Shirt className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <span className="font-bold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
            Mens Club
          </span>
        </Link>

        {/* Desktop Navigation */}
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
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative h-9 w-9 sm:h-10 sm:w-10">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
          
          {/* Desktop Account Links/Icon */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon" asChild aria-label="Profile">
                  <Link href={userRole === 'admin' ? '/admin/dashboard' : '/profile'}>
                    {userRole === 'admin' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
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

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open Menu" className="h-9 w-9 sm:h-10 sm:w-10">
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
                  {(isLoggedIn ? accountLinksLoggedIn : accountLinksLoggedOut).map((link) => (
                    link.isButton ? (
                       <SheetClose asChild key={`mobile-action-${link.label}`}>
                        <Button
                            variant="ghost"
                            onClick={link.onClick}
                            className={cn(
                                'flex items-center space-x-3 rounded-md p-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground justify-start',
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
                        href={link.href!} // Add non-null assertion if href can be undefined for button types
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
