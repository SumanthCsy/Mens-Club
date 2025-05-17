
// @/components/cart/cart-summary.tsx
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowRight, Ticket } from 'lucide-react';
import { Input } from '../ui/input';

interface CartSummaryProps {
  subtotal: number;
  shippingCost?: number; 
  discount?: number;
  total: number;
  checkoutButtonText?: string; // Made optional
  checkoutLink?: string; // Made optional
  showPromoCodeInput?: boolean;
  showCheckoutButton?: boolean; // New prop to control button visibility
}

export function CartSummary({
  subtotal,
  shippingCost,
  discount,
  total,
  checkoutButtonText = "Proceed to Checkout",
  checkoutLink = "/checkout",
  showPromoCodeInput = true,
  showCheckoutButton = true, // Default to true for cart page, will be false for checkout page
}: CartSummaryProps) {
  return (
    <Card className="shadow-lg border border-border/60">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm text-foreground">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {shippingCost !== undefined && (
          <div className="flex justify-between text-sm text-foreground">
            <span>Shipping</span>
            <span>₹{shippingCost.toFixed(2)}</span>
          </div>
        )}
        {shippingCost === undefined && (
           <div className="flex justify-between text-sm text-muted-foreground">
            <span>Shipping</span>
            <span>Calculated at next step</span>
          </div>
        )}
        {discount !== undefined && discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        {showPromoCodeInput && (
          <>
            <Separator />
            <div className="space-y-2 pt-2">
              <label htmlFor="promo-code" className="text-sm font-medium text-foreground">Promo Code</label>
              <div className="flex gap-2">
                <Input id="promo-code" placeholder="Enter code" className="h-10 text-base" />
                <Button variant="outline" className="h-10 whitespace-nowrap">Apply</Button>
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="flex justify-between text-xl font-bold text-foreground">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </CardContent>
      {showCheckoutButton && (
        <CardFooter>
          <Button asChild size="lg" className="w-full text-base group" disabled={total === 0 && subtotal === 0}>
            <Link href={checkoutLink}>
              {checkoutButtonText} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
