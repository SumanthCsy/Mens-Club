
// @/app/admin/analytics/sales/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BarChart3, DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

// Mock data for demonstration - replace with actual data fetching
const salesMetrics = [
  { title: "Total Revenue", value: "₹1,25,800", icon: DollarSign, trend: "+12% from last month" },
  { title: "Total Orders", value: "1,560", icon: ShoppingBag, trend: "+8% from last month" },
  { title: "Average Order Value", value: "₹80.64", icon: TrendingUp, trend: "+3% from last month" },
  { title: "New Customers", value: "230", icon: Users, trend: "+15 from last month" },
];

export default function AdminSalesAnalyticsPage() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Sales Analytics</h1>
                <p className="mt-1 text-md text-muted-foreground">View detailed reports on sales performance.</p>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {salesMetrics.map((metric) => (
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
            <CardTitle>Sales Performance Over Time</CardTitle>
            <CardDescription>Visualize sales trends, revenue, and order volume. (Chart placeholder)</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-20 bg-muted/30 rounded-md">
                <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Sales chart would be displayed here.</p>
                <p className="text-sm text-muted-foreground">Integrate a charting library like Recharts or ShadCN UI Charts.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
