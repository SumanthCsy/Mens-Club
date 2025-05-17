
// @/app/admin/analytics/customers/page.tsx
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
import { ArrowLeft, PieChart, RefreshCcw, Loader2, Users, UserPlus, BarChartHorizontalBig } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function AdminCustomerReportsPage() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleResetReports = async () => {
    setIsResetting(true);
    // Simulate reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Customer Reports Reset (SIMULATION)",
      description: "Aggregated customer report data would be cleared. Your actual user accounts and their order history remain unaffected. This is a simulated action.",
      duration: 7000,
    });
    setIsResetting(false);
    setShowResetConfirm(false);
  };

  const placeholderMetrics = [
    { title: "Total Customers", value: "0", icon: Users, hint: "Overall number of registered users" },
    { title: "New Signups (Last 30d)", value: "0", icon: UserPlus, hint: "Customers joined recently" },
    { title: "Returning Customers", value: "0%", icon: BarChartHorizontalBig, hint: "Percentage of repeat buyers" },
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

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <CardTitle>Customer Demographics & Behavior</CardTitle>
            <CardDescription>Understand your customer base better with data on demographics, purchase history, and engagement. (Data & Chart Integration Pending)</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="min-h-[300px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed border-border/50">
                <p className="text-muted-foreground text-lg">Customer Demographics Chart Placeholder</p>
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Signups</CardTitle>
                  <CardDescription>Newest members of your store. (Data Pending)</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">user1@example.com</p>
                   <p className="text-sm text-muted-foreground">user2@example.com</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                 <CardHeader>
                  <CardTitle className="text-lg">Top Customers</CardTitle>
                  <CardDescription>Customers with highest purchase value or frequency. (Data Pending)</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">customerA@example.com - ₹0.00</p>
                   <p className="text-sm text-muted-foreground">customerB@example.com - ₹0.00</p>
                </CardContent>
              </Card>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="outline" onClick={() => setShowResetConfirm(true)} disabled={isResetting}>
            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Reset Customer Reports (Simulated)
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
              <AlertDialogTitle>Reset Customer Reports?</AlertDialogTitle>
              <AlertDialogDescription>
                This is a simulated action. In a live system, this would clear aggregated customer report data. 
                Your actual user accounts and their order history would remain unaffected. Are you sure you want to proceed with this simulation?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetReports}
                disabled={isResetting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Reset Reports
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
