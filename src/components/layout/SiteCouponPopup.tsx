// @/components/layout/SiteCouponPopup.tsx
"use client";

import { useState, useEffect } from 'react';
import type { Coupon } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Tag, Copy, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const SESSION_STORAGE_KEY = 'siteCouponDismissed';

export function SiteCouponPopup() {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCoupon = async () => {
      setIsLoading(true);
      try {
        const dismissedInSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (dismissedInSession) {
          setIsLoading(false);
          return;
        }

        const now = new Date();
        const couponsRef = collection(db, "coupons");
        // Fetch a few potential candidates
        const q = query(
          couponsRef,
          where("isActive", "==", true),
          where("displayOnSite", "==", true),
          orderBy("createdAt", "desc"), // Example: get the newest one
          limit(5) // Fetch a few to pick from client-side if complex expiry logic needed
        );

        const querySnapshot = await getDocs(q);
        let foundCoupon: Coupon | null = null;

        for (const doc of querySnapshot.docs) {
          const data = doc.data() as Omit<Coupon, 'id'>;
          const expiryDate = data.expiryDate ? (data.expiryDate as Timestamp).toDate() : null;
          
          if (!expiryDate || expiryDate > now) {
            foundCoupon = { id: doc.id, ...data, expiryDate };
            break; // Found a suitable coupon
          }
        }
        
        if (foundCoupon) {
          setCoupon(foundCoupon);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error fetching site coupon:", error);
        // Don't show error to user, just don't display popup
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupon();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
  };

  const handleCopyCode = () => {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code)
        .then(() => {
          toast({ title: "Copied!", description: `Coupon code ${coupon.code} copied to clipboard.` });
        })
        .catch(err => {
          console.error("Failed to copy coupon code:", err);
          toast({ title: "Copy Failed", description: "Could not copy code.", variant: "destructive" });
        });
    }
  };

  if (isLoading || !isVisible || !coupon) {
    return null; // Don't render anything if loading, not visible, or no coupon
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-50 p-4 rounded-lg shadow-xl bg-card border border-primary/50 text-card-foreground transition-all duration-300 ease-in-out",
        "flex items-center gap-3 max-w-xs sm:max-w-sm",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
      )}
    >
      <Tag className="h-8 w-8 text-primary shrink-0" />
      <div className="flex-grow">
        <p className="text-sm font-medium">
          Use Coupon: <strong className="text-primary">{coupon.code}</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          Get {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue.toFixed(2)}`} off!
          {coupon.minPurchaseAmount ? ` Min. spend ₹${coupon.minPurchaseAmount.toFixed(2)}.` : ''}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
        onClick={handleCopyCode}
        aria-label="Copy coupon code"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
        onClick={handleDismiss}
        aria-label="Dismiss coupon popup"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
