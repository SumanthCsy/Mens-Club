
// @/app/admin/analytics/sales/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, BarChart3, RefreshCcw, Loader2, IndianRupee, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function AdminSalesAnalyticsPage() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleResetAnalytics = async () => {
    setIsResetting(true);
    // Simulate reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Sales Analytics Reset (SIMULATION)",
      description: "Aggregated sales report data would be cleared. Your actual order history remains unaffected. This is a simulated action.",
      duration: 7000,
    });
    setIsResetting(false);
    setShowResetConfirm(false);
  };

  const placeholderMetrics = [
    { title: "Total Revenue", value: "₹0.00", icon: IndianRupee, hint: "Overall sales income" },
    { title: "Total Orders", value: "0", icon: ShoppingBag, hint: "Number of orders placed" },
    { title: "Average Order Value", value: "₹0.00", icon: Users, hint: "Average amount per order" },
    { title: "Conversion Rate", value: "0%", icon: TrendingUp, hint: "Percentage of visits to sales" },
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
        {placeholderMetrics.map((metric) => (
          <Card key={metric.title} className="shadow-md border-border/60 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg border-border/60">
        <CardHeader>
            <CardTitle>Sales Performance Overview</CardTitle>
            <CardDescription>Visualize sales trends, revenue, and order volume. (Data & Chart Integration Pending)</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="min-h-[300px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed border-border/50">
                <p className="text-muted-foreground text-lg">Sales Chart Placeholder</p>
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Top Selling Products</CardTitle>
                  <CardDescription>Products with the highest sales volume. (Data Pending)</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">1. Product A - 0 units</p>
                   <p className="text-sm text-muted-foreground">2. Product B - 0 units</p>
                   <p className="text-sm text-muted-foreground">3. Product C - 0 units</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                 <CardHeader>
                  <CardTitle className="text-lg">Recent Sales Activity</CardTitle>
                  <CardDescription>Latest orders and their values. (Data Pending)</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">Order #XYZ - ₹0.00</p>
                   <p className="text-sm text-muted-foreground">Order #ABC - ₹0.00</p>
                </CardContent>
              </Card>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="outline" onClick={() => setShowResetConfirm(true)} disabled={isResetting}>
            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Reset Sales Analytics (Simulated)
          </Button>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Note: Live analytics require backend data integration and processing.
          </p>
        </CardFooter>
      </Card>

      {showResetConfirm && (
        <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Sales Analytics?</AlertDialogTitle>
              <AlertDialogDescription>
                This is a simulated action. In a live system, this would clear aggregated sales report data. 
                Your actual order history would remain unaffected. Are you sure you want to proceed with this simulation?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetAnalytics}
                disabled={isResetting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Reset Analytics
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
