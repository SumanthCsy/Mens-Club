
import type { Metadata } from 'next';
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
import { PageTransitionLoader } from '@/components/layout/PageTransitionLoader'; // New Import

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mens Club Keshavapatnam',
  description: 'Premium fashion for gentlemen in Keshavapatnam.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased font-sans`,
          "min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-foreground flex flex-col"
        )}
      >
        <CartProvider>
          <WishlistProvider>
            <PageTransitionLoader /> {/* Added PageTransitionLoader */}
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
