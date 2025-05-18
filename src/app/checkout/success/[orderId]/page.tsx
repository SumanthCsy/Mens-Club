// @/app/checkout/success/[orderId]/page.tsx
"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useEffect, useState, useRef } from 'react'; // Added useRef
import { cn } from '@/lib/utils';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [isIconAnimated, setIsIconAnimated] = useState(false);
  const [showTextContent, setShowTextContent] = useState(false);
  const soundPlayedRef = useRef(false); // Ref to track if sound has played

  useEffect(() => {
    // Play sound effect only once
    if (!soundPlayedRef.current) {
      const audio = new Audio('/success.mp3'); // Ensure success.mp3 is in your /public directory
      audio.play().catch(error => {
        console.warn("Audio autoplay prevented for /success.mp3:", error);
      });
      soundPlayedRef.current = true;
    }

    // Trigger icon animation
    const iconAnimationTimer = setTimeout(() => {
      setIsIconAnimated(true);
    }, 100); // Small delay to allow initial render for icon

    // Trigger text content visibility after icon animation (and sound starts)
    const textContentTimer = setTimeout(() => {
      setShowTextContent(true);
    }, 700);

    return () => {
      clearTimeout(iconAnimationTimer);
      clearTimeout(textContentTimer);
    };
  }, []); // Empty dependency array, effect runs once on mount

  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <CheckCircle
          className={cn(
            "mx-auto h-full w-full text-green-500 transition-all duration-700 ease-out",
            isIconAnimated
              ? "scale-100 opacity-100"
              : "scale-50 opacity-0" // Initial state for pop-in animation
          )}
        />
      </div>
      
      {/* Conditionally render text content */}
      {showTextContent && (
        <div className="transition-opacity duration-500 ease-in opacity-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-green-600 mb-4">
            Order Successful!
          </h1>
          <p className="text-lg text-foreground mb-2">
            Thank you for your purchase.
          </p>
          <p className="text-md text-muted-foreground mb-8">
            Your Order ID is: <span className="font-semibold text-primary break-all">{orderId || 'N/A'}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <Button asChild size="lg" className="flex-1 text-base">
              <Link href={`/profile/my-orders/${orderId}`}>
                View Order Details
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 text-base">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
