
// @/components/orders/InvoiceViewModal.tsx
"use client";

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
import type { Order } from "@/types";
import { generateInvoiceHTML, downloadHtmlInvoice } from '@/lib/invoice-generator';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, X } from "lucide-react";

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function InvoiceViewModal({ isOpen, onClose, order }: InvoiceViewModalProps) {
  if (!order) return null;

  const invoiceHtmlContent = generateInvoiceHTML(order);

  const handleDownload = () => {
    downloadHtmlInvoice(order, invoiceHtmlContent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-semibold">Invoice Preview: #{order.id}</DialogTitle>
          <DialogDescription>
            This is a preview of your invoice. You can download it as an HTML file.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow border-y border-border">
          <div 
            className="p-6 invoice-render-area" // Added class for potential future styling/targeting
            dangerouslySetInnerHTML={{ __html: invoiceHtmlContent }} 
          />
        </ScrollArea>
        
        <DialogFooter className="p-6 sm:justify-between gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
          <Button type="button" onClick={handleDownload} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Download HTML Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
