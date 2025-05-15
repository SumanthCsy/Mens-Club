// @/components/layout/navbar.tsx
"use client";

import Link from 'next/link';
import { ShoppingCart, User, Menu, Home, Store, LogIn, UserPlus, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Products', icon: Store },
];

const accountLinks = [
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/signup', label: 'Sign Up', icon: UserPlus },
];

export function Navbar() {
  const pathname = usePathname();
  // Initialize cartItemCount to 0
  const [cartItemCount, setCartItemCount] = useState(0); 

  // In a real app, you'd fetch cartItemCount from your global state management or API
  // For now, it will remain 0 unless updated by actual cart interactions.
  // The previous useEffect for random count is removed.

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Shirt className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
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

        <div className="flex items-center space-x-3">
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
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
             {/* Placeholder for logged-in user icon */}
            {/* <Button variant="ghost" size="icon" aria-label="User Account">
              <User className="h-5 w-5" />
            </Button> */}
          </div>


          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
              <div className="p-6">
                <Link href="/" className="flex items-center space-x-2 mb-6">
                  <Shirt className="h-7 w-7 text-primary" />
                  <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                    Mens Club
                  </span>
                </Link>
                <nav className="flex flex-col space-y-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center space-x-3 rounded-md p-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground',
                        pathname === link.href ? 'bg-accent text-accent-foreground font-semibold' : 'text-foreground/80'
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                  <hr className="my-3 border-border"/>
                  {accountLinks.map((link) => (
                     <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center space-x-3 rounded-md p-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground',
                        pathname === link.href ? 'bg-accent text-accent-foreground font-semibold' : 'text-foreground/80'
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
