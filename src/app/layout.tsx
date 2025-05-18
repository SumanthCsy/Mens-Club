
"use client"; // Mark as a Client Component module

// import type { Metadata } from 'next'; // Metadata type can still be used, but generation might be client-side
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { FloatingContactButtons } from '@/components/layout/FloatingContactButtons';
import { GlobalAdminNotifications } from '@/components/layout/GlobalAdminNotifications';
import { SiteCouponPopup } from '@/components/layout/SiteCouponPopup';
import { PageTransitionLoader } from '@/components/layout/PageTransitionLoader';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ThemeSettings } from '@/types';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Theme color definitions - must match those in admin/settings/theme/page.tsx
// This ensures RootLayout applies the correct HSL values.
const themeColorMap: Record<string, { primaryHsl: string; accentHsl: string; [key: string]: string }> = {
  default: { name: 'Default (Teal)', value: 'default', primaryHsl: '180 100% 25.1%', accentHsl: '180 100% 25.1%' },
  'sky-blue': { name: 'Sky Blue', value: 'sky-blue', primaryHsl: '200 100% 50%', accentHsl: '200 100% 50%' },
  yellow: { name: 'Sunny Yellow', value: 'yellow', primaryHsl: '45 100% 50%', accentHsl: '45 100% 50%' },
  blue: { name: 'Classic Blue', value: 'blue', primaryHsl: '220 100% 50%', accentHsl: '220 100% 50%' },
  lilac: { name: 'Lilac Purple', value: 'lilac', primaryHsl: '270 70% 60%', accentHsl: '270 70% 60%' },
  lemon: { name: 'Lemon Green', value: 'lemon', primaryHsl: '80 60% 50%', accentHsl: '80 60% 50%' },
  green: { name: 'Forest Green', value: 'green', primaryHsl: '120 60% 35%', accentHsl: '120 60% 35%' },
};

const defaultThemeSettings: ThemeSettings = {
  selectedColor: 'default',
  displayMode: 'light',
};

// export const metadata: Metadata = { // Static metadata; dynamic title handled in useEffect
//   title: 'Mens Club Keshavapatnam',
//   description: 'Premium fashion for gentlemen in Keshavapatnam.',
// };


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme loading is handled by useEffect, no need for separate isLoadingTheme state here for now
  // as the effect will run on mount and apply changes.

  useEffect(() => {
    // Set a default static title
    document.title = 'Mens Club Keshavapatnam';

    const settingsRef = doc(db, "settings", "themeConfiguration");
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      let activeTheme = defaultThemeSettings;
      if (docSnap.exists()) {
        const fetchedSettings = docSnap.data() as ThemeSettings;
        // Ensure fetched settings are valid before applying
        if (fetchedSettings.selectedColor && fetchedSettings.displayMode) {
            activeTheme = fetchedSettings;
        } else {
            console.warn("Fetched theme settings are incomplete, using defaults.");
        }
      } else {
        console.log("No theme settings found in Firestore, using defaults.");
      }
      
      const root = document.documentElement;
      if (activeTheme.displayMode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      const colorConfig = themeColorMap[activeTheme.selectedColor] || themeColorMap.default;
      root.style.setProperty('--primary', colorConfig.primaryHsl);
      root.style.setProperty('--accent', colorConfig.accentHsl);
      // Potentially set other CSS variables like --background, --foreground if your theme system is more complex
      // For now, globals.css :root and .dark handle these.

    }, (error) => {
      console.error("Error fetching theme settings from Firestore:", error);
      // Apply default theme on error to ensure consistent fallback
      const root = document.documentElement;
      root.classList.remove('dark'); 
      const colorConfig = themeColorMap.default;
      root.style.setProperty('--primary', colorConfig.primaryHsl);
      root.style.setProperty('--accent', colorConfig.accentHsl);
    });

    return () => unsubscribe(); // Cleanup Firestore listener
  }, []);


  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning is key for client-side <html> class changes */}
      <head>
         {/* Static metadata can go here. Title is set in useEffect for now. */}
        <meta name="description" content="Premium fashion for gentlemen in Keshavapatnam." />
      </head>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased font-sans`,
          "min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-foreground flex flex-col"
          // The 'dark' class is dynamically added/removed on `<html>` by the useEffect above.
          // The body's background gradient is static for now, dark mode primarily affects component backgrounds via CSS variables.
        )}
      >
        <CartProvider>
          <WishlistProvider>
            <PageTransitionLoader />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
            <FloatingContactButtons />
            <GlobalAdminNotifications />
            <SiteCouponPopup />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
