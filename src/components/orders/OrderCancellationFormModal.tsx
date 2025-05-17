
// @/components/orders/OrderCancellationFormModal.tsx
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
import { Label } from '@/components/ui/label'; // Corrected import
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareShare } from 'lucide-react';

interface OrderCancellationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const cancellationReasons = [
  "Ordered wrong size or color",
  "Found a better price elsewhere",
  "Delivery taking too long",
  "Changed my mind",
  "Payment issue or transaction failed",
  "Others",
];

export function OrderCancellationFormModal({ isOpen, onClose, order }: OrderCancellationFormModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Reset form when modal opens or order changes
    if (isOpen) {
      setSelectedReason("");
      setRemarks("");
    }
  }, [isOpen, order]);

  if (!order) return null;

  const handleSubmit = () => {
    if (!selectedReason) {
      toast({ title: "Reason Required", description: "Please select a reason for cancellation.", variant: "destructive" });
      return;
    }
    if (selectedReason === "Others" && !remarks.trim()) {
      toast({ title: "Remarks Required", description: "Please provide remarks for 'Others' reason.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const whatsappNumber = "919391157177"; // Admin's WhatsApp number
    let message = `Order Cancellation Request for Order ID: ${order.id}\n\n`;
    message += `Reason: ${selectedReason}\n`;
    if (selectedReason === "Others" && remarks.trim()) {
      message += `Remarks: ${remarks.trim()}\n`;
    }
    message += `\nCustomer Email: ${order.customerEmail}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    toast({
      title: "Redirecting to WhatsApp",
      description: "Please send the pre-filled message to request cancellation.",
      duration: 7000,
    });

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    setIsSubmitting(false);
    onClose(); // Close the modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Request Order Cancellation</DialogTitle>
          <DialogDescription>
            Order ID: <span className="font-medium text-primary">{order.id}</span>. 
            Please select a reason for cancellation.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <Label htmlFor="cancellationReason" className="text-sm font-medium mb-2 block">Reason for Cancellation:</Label>
            <RadioGroup
              id="cancellationReason"
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="space-y-2"
            >
              {cancellationReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={`reason-${reason.replace(/\s+/g, '-')}`} />
                  <Label htmlFor={`reason-${reason.replace(/\s+/g, '-')}`} className="font-normal cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === "Others" && (
            <div>
              <Label htmlFor="remarks" className="text-sm font-medium mb-2 block">
                Please specify your reason (Remarks):
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Please provide more details about your cancellation reason..."
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
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <MessageSquareShare className="mr-2 h-4 w-4" /> Submit via WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
