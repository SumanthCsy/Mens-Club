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
import { ArrowLeft, BarChart3, AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      
      <Card className="shadow-lg border-border/60">
        <CardHeader>
            <CardTitle>Sales Performance Overview</CardTitle>
            <CardDescription>Visualize sales trends, revenue, and order volume. (Data & Chart Integration Pending)</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Sales analytics feature is under development.</p>
                <p className="text-sm text-muted-foreground">Live data, charts, and advanced reporting tools will be available here soon to track your store's sales performance.</p>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="outline" onClick={() => setShowResetConfirm(true)} disabled={isResetting}>
            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Reset Sales Analytics (Simulated)
          </Button>
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
