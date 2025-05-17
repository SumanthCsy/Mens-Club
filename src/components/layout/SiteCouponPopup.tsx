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

const SESSION_STORAGE_KEY = 'siteCouponDismissed_v2'; // Changed key to ensure fresh state for testing

export function SiteCouponPopup() {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCoupon = async () => {
      setIsLoading(true);
      console.log("[SiteCouponPopup] Initializing. Checking session storage...");
      try {
        const dismissedInSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (dismissedInSession === 'true') {
          console.log("[SiteCouponPopup] Popup was dismissed in this session. Not showing.");
          setIsLoading(false);
          setIsVisible(false);
          return;
        }

        const now = new Date();
        const couponsRef = collection(db, "coupons");
        const q = query(
          couponsRef,
          where("isActive", "==", true),
          where("displayOnSite", "==", true),
          orderBy("createdAt", "desc"),
          limit(5) // Fetch a few candidates
        );

        console.log("[SiteCouponPopup] Fetching coupons from Firestore...");
        const querySnapshot = await getDocs(q);
        let foundCoupon: Coupon | null = null;

        const rawCoupons = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
        console.log("[SiteCouponPopup] Raw coupons fetched:", rawCoupons);

        for (const docData of rawCoupons) {
          const expiryDate = docData.expiryDate ? (docData.expiryDate as Timestamp).toDate() : null;
          
          // Log details for each potential coupon
          console.log(`[SiteCouponPopup] Checking coupon: ${docData.code}, Active: ${docData.isActive}, Display: ${docData.displayOnSite}, Expiry: ${expiryDate}`);

          if (!expiryDate || expiryDate > now) {
            foundCoupon = { ...docData, expiryDate }; // Ensure expiryDate is a JS Date object
            console.log(`[SiteCouponPopup] Suitable coupon found: ${foundCoupon.code}`);
            break; 
          } else {
            console.log(`[SiteCouponPopup] Coupon ${docData.code} is expired.`);
          }
        }
        
        if (foundCoupon) {
          console.log("[SiteCouponPopup] Setting coupon to display:", foundCoupon);
          setCoupon(foundCoupon);
          setIsVisible(true);
        } else {
          console.log("[SiteCouponPopup] No suitable, non-expired, displayable coupon found.");
          setCoupon(null);
          setIsVisible(false);
        }
      } catch (error) {
        console.error("[SiteCouponPopup] Error fetching site coupon:", error);
        setCoupon(null);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
        console.log("[SiteCouponPopup] Fetch attempt finished.");
      }
    };

    fetchCoupon();
  }, []);

  const handleDismiss = () => {
    console.log("[SiteCouponPopup] Dismiss button clicked. Hiding and setting session storage.");
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
          console.error("[SiteCouponPopup] Failed to copy coupon code:", err);
          toast({ title: "Copy Failed", description: "Could not copy code.", variant: "destructive" });
        });
    }
  };

  useEffect(() => {
    // Log visibility changes
    console.log(`[SiteCouponPopup] Visibility state: ${isVisible}, Coupon state:`, coupon, `Loading state: ${isLoading}`);
  }, [isVisible, coupon, isLoading]);


  if (isLoading) {
     // Optional: return a loader or null if you don't want any visual while loading
    console.log("[SiteCouponPopup] Render: Loading state active.");
    return null;
  }

  if (!isVisible || !coupon) {
    console.log("[SiteCouponPopup] Render: Not visible or no coupon. Rendering null.");
    return null;
  }
  
  console.log("[SiteCouponPopup] Render: Popup is visible with coupon:", coupon);
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
