// @/app/admin/analytics/customers/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, PieChart, AlertTriangle } from 'lucide-react';

export default function AdminCustomerReportsPage() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <PieChart className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Customer Reports</h1>
                <p className="mt-1 text-md text-muted-foreground">Gain insights into customer behavior and demographics.</p>
            </div>
        </div>
      </div>

       <Card className="shadow-lg border-border/60">
        <CardHeader>
            <CardTitle>Customer Demographics & Behavior</CardTitle>
            <CardDescription>Understand your customer base better with data on demographics, purchase history, and engagement. (Data & Chart Integration Pending)</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Customer reports feature is under development.</p>
                <p className="text-sm text-muted-foreground">Detailed customer analytics, segmentation, and lifetime value metrics will be available here soon.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
