
// @/app/admin/analytics/customers/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, PieChart, Users, UserPlus, ShoppingCart, Repeat } from 'lucide-react';

// Mock data for demonstration - replace with actual data fetching
const customerMetrics = [
  { title: "Total Customers", value: "1,820", icon: Users, trend: "+50 this month" },
  { title: "New Sign-ups", value: "120", icon: UserPlus, trend: "+10% from last month" },
  { title: "Repeat Customers", value: "450", icon: Repeat, trend: "25% of total" },
  { title: "Average Orders per Customer", value: "3.2", icon: ShoppingCart, trend: "Lifetime" },
];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {customerMetrics.map((metric) => (
          <Card key={metric.title} className="shadow-lg border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

       <Card className="shadow-lg border-border/60">
        <CardHeader>
            <CardTitle>Customer Demographics & Behavior</CardTitle>
            <CardDescription>Understand your customer base better with data on demographics, purchase history, and engagement. (Chart placeholder)</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-20 bg-muted/30 rounded-md">
                <PieChart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Customer demographics chart would be displayed here.</p>
                <p className="text-sm text-muted-foreground">Data on location, age, purchase frequency, etc.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
