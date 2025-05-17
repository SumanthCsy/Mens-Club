
// @/app/admin/interactions/inquiries/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, MessageCircleQuestion, Trash2, Loader2 } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Placeholder type for Inquiry data - will be needed when integrated
interface Inquiry {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string; // ISO string or Date object
  isRead?: boolean;
}

export default function AdminViewInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]); // Placeholder for actual inquiries
  const [isLoading, setIsLoading] = useState(false); // For future data fetching
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Placeholder delete function - adapt when real data is available
  const handleDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);
    // Simulate deletion
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Inquiry Deleted (SIMULATION)",
      description: `Inquiry from ${inquiryToDelete.senderName} regarding "${inquiryToDelete.subject}" would be deleted.`,
    });
    setInquiries(prev => prev.filter(i => i.id !== inquiryToDelete.id));
    setInquiryToDelete(null);
    setIsDeleting(false);
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
          <MessageCircleQuestion className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">View Inquiries</h1>
            <p className="mt-1 text-md text-muted-foreground">Manage customer questions and support requests.</p>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>Customer Inquiries ({inquiries.length})</CardTitle>
          <CardDescription>Respond to customer messages and support tickets. (Data Integration Pending)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="text-center py-10">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-lg text-muted-foreground">Loading inquiries...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-md border border-dashed border-border/50">
              <MessageCircleQuestion className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h2 className="text-xl font-semibold text-foreground mb-3">No Inquiries Yet</h2>
              <p className="text-muted-foreground">
                When users submit inquiries via your contact form or support system, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sender</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="min-w-[200px]">Subject</TableHead>
                    <TableHead>Date Received</TableHead>
                    <TableHead className="text-center w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.senderName}</TableCell>
                      <TableCell>{inquiry.senderEmail}</TableCell>
                      <TableCell>{inquiry.subject}</TableCell>
                      <TableCell>{new Date(inquiry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setInquiryToDelete(inquiry)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Note: Inquiry management requires a contact form or support system integration on your website.
            </p>
        </CardFooter>
      </Card>

      {inquiryToDelete && (
        <AlertDialog open={!!inquiryToDelete} onOpenChange={(open) => !open && setInquiryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Inquiry?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this inquiry from {inquiryToDelete.senderName} regarding "{inquiryToDelete.subject}"? This is a simulated action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteInquiry}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Delete Inquiry (Simulated)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
