
// @/components/admin/AdminOrderCancellationModal.tsx
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

interface AdminOrderCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmCancellation: (reason: string, remarks?: string) => Promise<void>;
}

const adminCancellationReasons = [
  "Out of stock",
  "Quality check failed",
  "Pricing error",
  "Fraudulent order",
  "Shipping not available",
  "Customer requested to Cancel",
  "Others",
];

export function AdminOrderCancellationModal({ isOpen, onClose, order, onConfirmCancellation }: AdminOrderCancellationModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedReason("");
      setRemarks("");
    }
  }, [isOpen]);

  if (!order) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast({ title: "Reason Required", description: "Please select a reason for cancellation.", variant: "destructive" });
      return;
    }
    if (selectedReason === "Others" && !remarks.trim()) {
      toast({ title: "Remarks Required", description: "Please provide remarks for 'Others' reason.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalReason = selectedReason === "Others" ? (remarks.trim() || "Others - No specific remarks provided by admin") : selectedReason;
      await onConfirmCancellation(finalReason, selectedReason === "Others" ? remarks.trim() : undefined);
      // Toast for success will be handled by the parent component after Firestore update
      onClose();
    } catch (error) {
        console.error("Error confirming cancellation:", error);
        toast({ title: "Error", description: "Could not process cancellation.", variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Confirm Order Cancellation (Admin)</DialogTitle>
          <DialogDescription>
            Order ID: <span className="font-medium text-primary">{order.id || 'N/A'}</span>. 
            Select a reason to cancel this order.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <Label htmlFor="adminCancellationReason" className="text-sm font-medium mb-2 block">Reason for Cancellation:</Label>
            <RadioGroup
              id="adminCancellationReason"
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="space-y-2"
            >
              {adminCancellationReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={`admin-reason-${reason.replace(/\s+/g, '-')}`} />
                  <Label htmlFor={`admin-reason-${reason.replace(/\s+/g, '-')}`} className="font-normal cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === "Others" && (
            <div>
              <Label htmlFor="admin-remarks" className="text-sm font-medium mb-2 block">
                Please specify your reason (Remarks):
              </Label>
              <Textarea
                id="admin-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Provide details for 'Others' reason..."
                rows={3}
                className="text-base"
                required
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Back
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Confirm Cancellation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
