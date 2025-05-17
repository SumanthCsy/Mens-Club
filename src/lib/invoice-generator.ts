
// @/lib/invoice-generator.ts
'use client';

import type { Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

/**
 * Simulates invoice generation and triggers a download of a plain text file
 * (masquerading as a PDF) representing the invoice, with a format inspired by common invoice layouts.
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

  const storeName = "Mens Club Keshavapatnam";
  const invoiceDate = order.createdAt ? format(new Date(order.createdAt), 'dd-MM-yyyy') : 'N/A';
  const invoiceDateTime = order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'N/A';


  let invoiceContent = `
${storeName.toUpperCase()}
==================================================
Invoice #: ${order.id}
Order ID: ${order.id}
Date: ${invoiceDate}
Time: ${order.createdAt ? format(new Date(order.createdAt), 'p') : 'N/A'}
--------------------------------------------------

Customer Information:
---------------------
Name: ${order.shippingAddress.fullName}
Email: ${order.customerEmail}
Phone: ${order.shippingAddress.phoneNumber || 'N/A'}

Shipping Address:
${order.shippingAddress.addressLine1}
${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '\n' : ''}${order.shippingAddress.city}, ${order.shippingAddress.stateProvince} ${order.shippingAddress.postalCode}
${order.shippingAddress.country}

--------------------------------------------------
Product Information:
--------------------------------------------------
| Product Name                         | Qty | Unit Price (₹) | Total (₹)   |
|--------------------------------------|-----|----------------|-------------|
`;

  order.items.forEach(item => {
    const productName = `${item.name} (Size: ${item.selectedSize || 'N/A'}${item.selectedColor ? ', Color: ' + item.selectedColor : ''})`;
    const quantity = item.quantity.toString();
    const unitPrice = item.price.toFixed(2);
    const itemTotal = (item.price * item.quantity).toFixed(2);

    invoiceContent += `| ${productName.padEnd(36).substring(0,36)} | ${quantity.padStart(3)} | ${unitPrice.padStart(14)} | ${itemTotal.padStart(11)} |\n`;
  });

  invoiceContent += `
--------------------------------------------------
Payment Summary:
--------------------------------------------------
Subtotal:                              ₹${order.subtotal.toFixed(2).padStart(10)}
Shipping:                              ₹${order.shippingCost.toFixed(2).padStart(10)}
`;

  if (order.discount && order.discount > 0) {
    invoiceContent += `Discount:                             -₹${order.discount.toFixed(2).padStart(10)}\n`;
  }

  invoiceContent += `
GRAND TOTAL:                           ₹${order.grandTotal.toFixed(2).padStart(10)}
--------------------------------------------------

Payment Information:
--------------------
Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
Payment Status: ${order.status === 'Delivered' ? 'Paid' : (order.status === 'Pending' || order.status === 'Processing' ? 'Pending' : order.status)} 
Order Status: ${order.status}

--------------------------------------------------
Terms & Conditions (Example):
1. Goods once sold will not be taken back or exchanged.
2. All disputes subject to Keshavapatnam jurisdiction.
3. Thank you for your business!

==================================================
This is a simulated invoice generated on ${invoiceDateTime}.
`;

  // Create a Blob with the text content, but set MIME type to application/pdf
  const blob = new Blob([invoiceContent.trim()], { type: 'application/pdf' });

  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `invoice-${order.id}-simulated.pdf`; // Filename for the download with .pdf extension

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href); // Clean up the object URL

  toast({
    title: 'Simulated PDF Invoice Downloaded',
    description: `A file (invoice-${order.id}-simulated.pdf) with order details has been downloaded. Actual styled PDF generation would require a dedicated library.`,
    duration: 9000,
  });

  // Log to console as well, for developer reference
  console.log(`--- Simulated PDF Invoice Generation & Download for Order: ${order.id} ---`);
  console.log("Content:\n", invoiceContent.trim());
  console.log("INFO: This is a simulation. To implement actual PDF generation, use a library like jsPDF.");
}
