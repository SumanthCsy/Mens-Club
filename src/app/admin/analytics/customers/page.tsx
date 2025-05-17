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
import { ArrowLeft, PieChart, AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        <CardFooter className="border-t pt-6">
          <Button variant="outline" onClick={() => setShowResetConfirm(true)} disabled={isResetting}>
            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Reset Customer Reports (Simulated)
          </Button>
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
