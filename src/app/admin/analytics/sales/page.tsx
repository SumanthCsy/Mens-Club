
// @/app/admin/analytics/sales/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BarChart3, DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

export default function AdminSalesAnalyticsPage() {
  // Placeholder data for key metrics
  const keyMetrics = [
    { title: "Total Revenue", value: "₹0.00", icon: DollarSign, change: "+0%" },
    { title: "Total Orders", value: "0", icon: ShoppingCart, change: "+0%" },
    { title: "Average Order Value", value: "₹0.00", icon: TrendingUp, change: "+0%" },
    { title: "Conversion Rate", value: "0%", icon: Users, change: "+0%" }
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
            <BarChart3 className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Sales Analytics</h1>
                <p className="mt-1 text-md text-muted-foreground">View detailed reports on sales performance.</p>
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
            <CardTitle>Sales Performance Overview</CardTitle>
            <CardDescription>Visualize sales trends, revenue, and order volume. (Charts are placeholders)</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md border-2 border-dashed border-border/50">
                <p className="text-muted-foreground text-lg">Sales Chart Area (Data & Chart Integration Pending)</p>
            </div>
             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">List of top products will appear here. (Data pending)</p>
                    </CardContent>
                </Card>
                 <Card className="shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle className="text-lg">Sales by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Category performance breakdown will appear here. (Data pending)</p>
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
