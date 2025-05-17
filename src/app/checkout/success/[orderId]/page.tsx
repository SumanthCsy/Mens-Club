// @/app/checkout/success/[orderId]/page.tsx
"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <Card className="w-full max-w-lg shadow-xl border border-green-500/30 bg-green-50/30">
        <CardHeader className="pb-4">
          <CheckCircle className="mx-auto h-20 w-20 text-green-500 animate-pulse mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-green-600">
            Order Successful!
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground mt-2">
            Thank you for your purchase. Your order has been placed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg text-foreground">
            Your Order ID is: <span className="font-semibold text-primary break-all">{orderId || 'N/A'}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            You can view your order details and track its status in your account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button asChild size="lg" className="w-full sm:flex-1 text-base">
            <Link href={`/profile/my-orders/${orderId}`}>
              View Order Details
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:flex-1 text-base">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
