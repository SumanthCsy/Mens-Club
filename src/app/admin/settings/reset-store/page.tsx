// @/app/admin/settings/reset-store/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function AdminResetStorePage() {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const handleResetConfirmation = async () => {
    if (confirmationText !== "RESET MY STORE") {
      toast({
        title: "Confirmation Failed",
        description: "You must type 'RESET MY STORE' exactly to confirm.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    // Simulate a delay for the reset process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real application, this is where you would trigger a backend function
    // to delete all relevant data from Firestore (products, orders, user data, etc.).
    // This frontend action is only a simulation.
    console.warn("SIMULATION: Store data reset initiated by admin.");

    toast({
      title: "Store Data Reset Initiated (Simulation)",
      description: "A backend process would now clear all products, orders, and transactional data. This would also reset all analytics and customer reports as they are derived from this core data. No actual data has been deleted by this front-end action.",
      variant: "default",
      duration: 10000,
    });
    setIsResetting(false);
    setShowConfirmationDialog(false);
    setConfirmationText(""); // Clear confirmation text
  };

  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-destructive">Reset Store Data</h1>
                <p className="mt-1 text-md text-muted-foreground">Permanently delete store data (Simulated Action).</p>
            </div>
        </div>
      </div>

      <Card className="shadow-lg border-destructive/60 bg-destructive/5">
        <CardHeader>
            <CardTitle className="text-xl text-destructive">Extreme Caution Required</CardTitle>
            <CardDescription className="text-destructive/80">
                This action will simulate the deletion of ALL products, orders, customer information,
                and other transactional data from your store. Consequently, all analytics and customer reports
                would also be reset as they are based on this data. This action is irreversible once performed by a backend process.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 border border-destructive/30 rounded-md bg-destructive/10">
                <h4 className="font-semibold text-destructive mb-2">Before you proceed:</h4>
                <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1">
                    <li>Ensure you have a backup of any data you wish to keep.</li>
                    <li>Understand that this is a simulation. No actual data will be deleted by this front-end action.</li>
                    <li>A full and permanent reset requires a dedicated backend process.</li>
                    <li>This action cannot be undone through the UI once confirmed (simulated).</li>
                </ul>
            </div>
            
            <Button 
                variant="destructive" 
                className="w-full text-lg py-3"
                onClick={() => setShowConfirmationDialog(true)}
                disabled={isResetting}
            >
                {isResetting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <AlertTriangle className="mr-2 h-5 w-5" />
                )}
                Initiate Full Store Reset (Simulated)
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                This is a simulated action. For a production environment, implement robust backend data deletion with proper safeguards.
            </p>
        </CardContent>
      </Card>

      {showConfirmationDialog && (
        <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">Confirm Store Data Reset</AlertDialogTitle>
                <AlertDialogDescription>
                    This is a highly destructive and irreversible action (simulated). 
                    You are about to simulate the deletion of all products, orders, and other transactional data.
                    This would also reset all analytics and customer reports.
                    To confirm, please type <strong className="text-destructive">RESET MY STORE</strong> into the box below.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Input 
                        type="text"
                        placeholder="Type RESET MY STORE to confirm"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="border-destructive focus:ring-destructive"
                    />
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmationText("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleResetConfirmation}
                    disabled={isResetting || confirmationText !== "RESET MY STORE"}
                    className="bg-destructive hover:bg-destructive/90"
                >
                    {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirm Reset (Simulated)
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
