
// @/app/admin/analytics/customers/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, PieChart, Users, UserPlus, Repeat, Activity } from 'lucide-react';

export default function AdminCustomerReportsPage() {
   // Placeholder data for key metrics
  const keyMetrics = [
    { title: "Total Customers", value: "0", icon: Users, change: "+0" },
    { title: "New Customers (Month)", value: "0", icon: UserPlus, change: "+0" },
    { title: "Returning Customers", value: "0%", icon: Repeat, change: "+0%" },
    { title: "Customer Activity", value: "N/A", icon: Activity, change: "" }
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {keyMetrics.map((metric) => (
          <Card key={metric.title} className="shadow-md border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} from last month (Data not live)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

       <Card className="shadow-lg border-border/60">
        <CardHeader>
            <CardTitle>Customer Demographics & Behavior</CardTitle>
            <CardDescription>Understand your customer base better with data on demographics, purchase history, and engagement. (Charts are placeholders)</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md border-2 border-dashed border-border/50">
                <p className="text-muted-foreground text-lg">Customer Demographics Chart Area (Data & Chart Integration Pending)</p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Signups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">List of new customers will appear here. (Data pending)</p>
                    </CardContent>
                </Card>
                 <Card className="shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Customers by Purchase</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">List of top customers will appear here. (Data pending)</p>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>
      <p className="mt-6 text-xs text-center text-muted-foreground">
        Note: All data displayed on this page is placeholder data. Live analytics require backend integration.
      </p>
    </div>
  );
}
