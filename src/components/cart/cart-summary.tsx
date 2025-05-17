
// @/components/cart/cart-summary.tsx
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowRight, Tag, X, Eye, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';

interface CartSummaryProps {
  subtotal: number;
  shippingCost?: number;
  discountAmount?: number; // Changed from discount to discountAmount for clarity
  total: number;
  checkoutButtonText?: string;
  checkoutLink?: string;
  showPromoCodeInput?: boolean;
  showCheckoutButton?: boolean;
  appliedCouponCode?: string | null;
  onApplyPromoCode?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => void;
  onViewCouponsClick?: () => void;
  isApplyingCoupon?: boolean;
}

export function CartSummary({
  subtotal,
  shippingCost,
  discountAmount,
  total,
  checkoutButtonText = "Proceed to Checkout",
  checkoutLink = "/checkout",
  showPromoCodeInput = true,
  showCheckoutButton = true,
  appliedCouponCode,
  onApplyPromoCode,
  onRemoveCoupon,
  onViewCouponsClick,
  isApplyingCoupon,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState('');

  const displaySubtotal = typeof subtotal === 'number' ? subtotal.toFixed(2) : '0.00';
  const displayShippingCost = typeof shippingCost === 'number' ? shippingCost.toFixed(2) : '0.00';
  const displayDiscount = typeof discountAmount === 'number' && discountAmount > 0 ? discountAmount.toFixed(2) : null;
  const displayTotal = typeof total === 'number' ? total.toFixed(2) : '0.00';

  const handleApplyClick = () => {
    if (promoCode.trim() && onApplyPromoCode) {
      onApplyPromoCode(promoCode.trim());
    }
  };

  return (
    <Card className="shadow-lg border border-border/60">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm text-foreground">
          <span>Subtotal</span>
          <span>₹{displaySubtotal}</span>
        </div>

        {shippingCost !== undefined ? (
          <div className="flex justify-between text-sm text-foreground">
            <span>Shipping</span>
            <span>₹{displayShippingCost}</span>
          </div>
        ) : (
           <div className="flex justify-between text-sm text-muted-foreground">
            <span>Shipping</span>
            <span>Calculated at next step</span>
          </div>
        )}

        {appliedCouponCode && displayDiscount ? (
          <div className="flex justify-between text-sm text-green-600 items-center">
            <span>Discount ({appliedCouponCode})</span>
            <div className="flex items-center gap-1">
              <span>-₹{displayDiscount}</span>
              {onRemoveCoupon && (
                <Button variant="ghost" size="icon" onClick={onRemoveCoupon} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ) : !appliedCouponCode && displayDiscount && Number(displayDiscount) > 0 ? (
          // Fallback if discountAmount is set but no coupon code (e.g. automatic discount)
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-₹{displayDiscount}</span>
          </div>
        ) : null}
        
        {showPromoCodeInput && !appliedCouponCode && (
          <>
            <Separator />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label htmlFor="promo-code" className="text-sm font-medium text-foreground">Promo Code</label>
                {onViewCouponsClick && (
                  <Button variant="link" size="sm" onClick={onViewCouponsClick} className="text-xs h-auto p-0">
                    <Eye className="mr-1 h-3.5 w-3.5"/> View Coupons
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Input 
                  id="promo-code" 
                  placeholder="Enter code" 
                  className="h-10 text-base" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={isApplyingCoupon}
                />
                <Button 
                  variant="outline" 
                  className="h-10 whitespace-nowrap" 
                  onClick={handleApplyClick} 
                  disabled={!promoCode.trim() || !onApplyPromoCode || isApplyingCoupon}
                >
                  {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="flex justify-between text-xl font-bold text-foreground">
          <span>Total</span>
          <span>₹{displayTotal}</span>
        </div>
      </CardContent>
      {showCheckoutButton && (
        <CardFooter>
          <Button asChild size="lg" className="w-full text-base group" disabled={Number(displayTotal) <= 0 && Number(displaySubtotal) <= 0}>
            <Link href={checkoutLink}>
              {checkoutButtonText} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
