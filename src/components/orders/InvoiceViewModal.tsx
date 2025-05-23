
// @/components/orders/InvoiceViewModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";
import { generateInvoiceHTML, downloadHtmlInvoice } from '@/lib/invoice-generator';
import { Download, X } from "lucide-react";

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function InvoiceViewModal({ isOpen, onClose, order }: InvoiceViewModalProps) {
  if (!order) return null;

  const invoiceHtmlContentForPreview = generateInvoiceHTML(order); 

  const handleDownload = () => {
    downloadHtmlInvoice(order, invoiceHtmlContentForPreview); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-2xl font-semibold">Invoice Preview: #{order.id}</DialogTitle>
          <DialogDescription>
            Review your invoice below. You can download it as an HTML file.
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable content area using a standard div with overflow */}
        <div className="flex-grow min-h-0 overflow-y-auto p-6">
          <div
            dangerouslySetInnerHTML={{ __html: invoiceHtmlContentForPreview }}
          />
        </div>
        
        <DialogFooter className="p-6 sm:justify-between gap-2 border-t border-border shrink-0">
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
