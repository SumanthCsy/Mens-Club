
// @/components/checkout/AvailableCouponsModal.tsx
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Coupon } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Loader2, Tag, X, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AvailableCouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon: (couponCode: string) => Promise<void>; // Function to call when user clicks "Apply"
  currentSubtotal: number;
}

export function AvailableCouponsModal({ isOpen, onClose, onApplyCoupon, currentSubtotal }: AvailableCouponsModalProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchCoupons = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const now = new Date();
          const couponsRef = collection(db, "coupons");
          const q = query(
            couponsRef,
            where("isActive", "==", true),
            where("displayOnSite", "==", true)
            // Expiry check needs to be handled client-side if expiryDate can be null
            // or if we want to compare with current server time (complex with client-side query).
            // For now, we fetch and then filter.
          );
          const querySnapshot = await getDocs(q);
          const fetchedCoupons: Coupon[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<Coupon, 'id'>;
            const expiryDate = data.expiryDate ? (data.expiryDate as Timestamp).toDate() : null;
            if (!expiryDate || expiryDate > now) { // Only include non-expired or no-expiry coupons
              fetchedCoupons.push({ id: doc.id, ...data, expiryDate });
            }
          });
          setCoupons(fetchedCoupons);
        } catch (err) {
          console.error("Error fetching available coupons:", err);
          setError("Could not load available coupons. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchCoupons();
    }
  }, [isOpen]);

  const handleApply = async (couponCode: string) => {
    await onApplyCoupon(couponCode);
    onClose(); // Close modal after attempting to apply
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast({ title: "Copied!", description: `Coupon code ${code} copied to clipboard.` });
      })
      .catch(err => {
        console.error("Failed to copy coupon code:", err);
        toast({ title: "Copy Failed", description: "Could not copy code.", variant: "destructive" });
      });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `₹${coupon.discountValue.toFixed(2)} OFF`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Available Coupons</DialogTitle>
          <DialogDescription>
            Select a coupon to apply to your order.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto py-4 space-y-3 pr-2">
          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="text-center text-destructive p-4">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              {error}
            </div>
          )}
          {!isLoading && !error && coupons.length === 0 && (
            <div className="text-center text-muted-foreground p-4">
              <Tag className="mx-auto h-10 w-10 mb-3" />
              No coupons currently available for display.
            </div>
          )}
          {!isLoading && !error && coupons.map((coupon) => {
            const meetsMinPurchase = !coupon.minPurchaseAmount || currentSubtotal >= coupon.minPurchaseAmount;
            return (
              <Card key={coupon.id} className="shadow-sm border-border/70">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-primary">{coupon.code}</h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => handleCopyCode(coupon.code)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm font-bold text-green-600">{formatDiscount(coupon)}</p>
                    {coupon.minPurchaseAmount && (
                      <p className={`text-xs mt-0.5 ${meetsMinPurchase ? 'text-muted-foreground' : 'text-amber-600'}`}>
                        Min. purchase: ₹{coupon.minPurchaseAmount.toFixed(2)}
                        {!meetsMinPurchase && " (Not met)"}
                      </p>
                    )}
                    {coupon.expiryDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Expires: {format(new Date(coupon.expiryDate), 'dd MMM, yyyy')}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApply(coupon.code)}
                    disabled={!meetsMinPurchase}
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    {meetsMinPurchase ? "Apply Coupon" : "Min. Spend Not Met"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
