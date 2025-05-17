
// @/app/admin/settings/shipping/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Truck, MapPin, DollarSign, Cog } from 'lucide-react';

export default function AdminShippingSettingsPage() {
  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
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
                <p className="mt-1 text-md text-muted-foreground">Set up shipping zones, rates, methods, and delivery options.</p>
            </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
            <CardTitle>Shipping Options Management</CardTitle>
            <CardDescription>
              Manage how you ship products to customers. This section will allow you to define shipping zones, 
              set up flat rates, configure weight-based shipping, or integrate with third-party shipping solutions.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-6 border border-dashed border-border/50 rounded-lg bg-muted/30 text-center">
                <Cog className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-spin-slow" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Shipping Settings Hub</h3>
                <p className="text-muted-foreground">
                    Advanced shipping configuration tools are under construction. Features coming soon:
                </p>
                <ul className="list-disc list-inside text-left text-muted-foreground text-sm mt-3 inline-block">
                    <li>Defining custom shipping zones (e.g., by city, state, pincode).</li>
                    <li>Setting up various shipping rates (flat rate, free shipping thresholds).</li>
                    <li>Weight-based or dimension-based shipping calculations.</li>
                    <li>Integration with popular shipping carriers.</li>
                    <li>Local pickup options.</li>
                </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/> Shipping Zones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Define geographical areas for specific shipping rules. (Feature Pending)</p>
                        <Button variant="outline" className="mt-3 w-full" disabled>Manage Zones</Button>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary"/> Shipping Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Set costs for shipping to different zones or based on order value. (Feature Pending)</p>
                         <Button variant="outline" className="mt-3 w-full" disabled>Configure Rates</Button>
                    </CardContent>
                </Card>
            </div>
             <p className="text-xs text-muted-foreground text-center">
                Check back soon for comprehensive shipping configuration tools!
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Add this to your globals.css or tailwind.config.js if you want the slow spin animation
// @keyframes spin-slow {
//   to {
//     transform: rotate(360deg);
//   }
// }
// .animate-spin-slow {
//   animation: spin-slow 3s linear infinite;
// }
