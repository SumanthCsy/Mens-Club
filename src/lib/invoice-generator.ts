
// @/lib/invoice-generator.ts
'use client';

import type { Order } from '@/types';
import { toast } from '@/hooks/use-toast';

/**
 * Simulates invoice generation and triggers a download of a plain text file
 * representing the invoice. In a real application, this would use a library
 * like jsPDF to create and offer a PDF document.
 *
 * @param order The order object for which to simulate invoice generation.
 */
export function generateInvoicePdf(order: Order | null) {
  if (!order || !order.id) {
    toast({
      title: 'Error Simulating Invoice',
      description: 'Order data or Order ID is not available.',
      variant: 'destructive',
    });
    return;
  }

  // 1. Construct simple text-based invoice content
  let invoiceContent = `Invoice for Order: ${order.id}\n`;
  invoiceContent += `Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}\n\n`;
  invoiceContent += `Customer: ${order.shippingAddress.fullName}\n`;
  invoiceContent += `Email: ${order.customerEmail}\n`;
  if (order.shippingAddress.phoneNumber) {
    invoiceContent += `Phone: ${order.shippingAddress.phoneNumber}\n`;
  }
  invoiceContent += `\nShipping Address:\n`;
  invoiceContent += `${order.shippingAddress.addressLine1}\n`;
  if (order.shippingAddress.addressLine2) {
    invoiceContent += `${order.shippingAddress.addressLine2}\n`;
  }
  invoiceContent += `${order.shippingAddress.city}, ${order.shippingAddress.stateProvince} ${order.shippingAddress.postalCode}\n`;
  invoiceContent += `${order.shippingAddress.country}\n\n`;

  invoiceContent += "Items:\n";
  invoiceContent += "--------------------------------------------------\n";
  order.items.forEach(item => {
    invoiceContent += `${item.name} (Size: ${item.selectedSize || 'N/A'}, Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}\n`;
  });
  invoiceContent += "--------------------------------------------------\n\n";

  invoiceContent += `Subtotal: ₹${order.subtotal.toFixed(2)}\n`;
  invoiceContent += `Shipping: ₹${order.shippingCost.toFixed(2)}\n`;
  if (order.discount && order.discount > 0) {
    invoiceContent += `Discount: -₹${order.discount.toFixed(2)}\n`;
  }
  invoiceContent += `Grand Total: ₹${order.grandTotal.toFixed(2)}\n\n`;
  invoiceContent += `Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}\n`;
  invoiceContent += `Status: ${order.status}\n\n`;
  invoiceContent += "Thank you for your order!\n";
  invoiceContent += "Mens Club Keshavapatnam\n";

  // 2. Create a Blob with the text content
  const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });

  // 3. Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `invoice-${order.id}-simulated.txt`; // Filename for the download

  // 4. Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href); // Clean up the object URL

  toast({
    title: 'Simulated Invoice Downloaded',
    description: `A text file (invoice-${order.id}-simulated.txt) with order details has been downloaded. Actual PDF generation is a future feature.`,
    duration: 9000,
  });

  // Log to console as well, for developer reference
  console.log(`--- Simulated Invoice Generation & Download for Order: ${order.id} ---`);
  console.log("Content:\n", invoiceContent);
  console.log("INFO: This is a simulation. To implement actual PDF generation, use a library like jsPDF.");
}
