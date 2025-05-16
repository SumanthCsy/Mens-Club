
// @/app/admin/settings/shipping/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Truck } from 'lucide-react';

export default function AdminShippingSettingsPage() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <Truck className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Shipping Configuration</h1>
                <p className="mt-1 text-md text-muted-foreground">Set up shipping zones, rates, and methods.</p>
            </div>
        </div>
      </div>

      <Card className="shadow-lg border-border/60">
        <CardHeader>
            <CardTitle>Shipping Options</CardTitle>
            <CardDescription>Manage how you ship products to customers.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-10">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Shipping configuration feature is under development.</p>
                <p className="text-sm text-muted-foreground">Check back soon for updates!</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
