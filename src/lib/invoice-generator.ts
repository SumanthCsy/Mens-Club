
// @/lib/invoice-generator.ts
'use client';

import type { Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

/**
 * Generates an HTML string representation of the invoice.
 * @param order The order object.
 * @returns An HTML string.
 */
export function generateInvoiceHTML(order: Order): string {
  const storeName = "Mens Club Keshavapatnam";
  const storeAddress = "Main Road, Keshavapatnam, Telangana"; // Example
  const storeContact = "Email: contact@mensclubkpm.com | Phone: +91 9876543210"; // Example

  const invoiceDate = order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : 'N/A';
  const invoiceDateTime = order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'N/A';

  let itemsHTML = '';
  order.items.forEach((item, index) => {
    itemsHTML += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align:left;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align:left;">
          ${item.name}<br>
          <small>Size: ${item.selectedSize || 'N/A'}${item.selectedColor ? `, Color: ${item.selectedColor}` : ''}</small><br>
          <small>SKU: ${item.sku || 'N/A'}</small>
        </td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  });

  // Note: The outer <html> and <body> tags are removed here as this HTML
  // will be injected into a div within the modal. The styles are kept for now.
  const htmlContent = `
      <style>
        .invoice-container-modal { font-family: 'Arial', sans-serif; color: #333; padding:10px; } /* Adjusted padding */
        .invoice-container-modal .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .invoice-container-modal .header h1 { margin: 0; color: #333; font-size: 22px; } /* Adjusted font size */
        .invoice-container-modal .store-details p { margin: 2px 0; font-size: 11px; } /* Adjusted font size */
        .invoice-container-modal .invoice-details-table, .invoice-container-modal .customer-details-table { margin-bottom: 15px; font-size: 13px; width: 100%; } /* Adjusted font size */
        .invoice-container-modal .invoice-details-table td, .invoice-container-modal .customer-details-table td { padding: 4px; text-align: left; }
        .invoice-container-modal .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px; } /* Adjusted font size */
        .invoice-container-modal .items-table th { background-color: #f0f0f0; border: 1px solid #ddd; padding: 8px; text-align: left; }
        .invoice-container-modal .items-table td { border: 1px solid #ddd; padding: 6px; } /* Adjusted padding */
        .invoice-container-modal .totals { float: right; width: 45%; margin-top: 15px; font-size: 13px; } /* Adjusted font size */
        .invoice-container-modal .totals table { width: 100%; }
        .invoice-container-modal .totals td { padding: 4px; } /* Adjusted padding */
        .invoice-container-modal .totals .grand-total { font-weight: bold; font-size: 15px; } /* Adjusted font size */
        .invoice-container-modal .footer { text-align: center; margin-top: 25px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #777; } /* Adjusted font size */
        .invoice-container-modal .clearfix::after { content: ""; clear: both; display: table; }
      </style>
      <div class="invoice-container-modal" id="invoiceToPrint-${order.id}">
        <div class="header">
          <h1>${storeName}</h1>
          <div class="store-details">
            <p>${storeAddress}</p>
            <p>${storeContact}</p>
          </div>
        </div>

        <table class="invoice-details-table">
          <tr>
            <td style="width:50%; vertical-align:top;">
              <strong>Billed To:</strong><br>
              ${order.shippingAddress.fullName}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
              ${order.shippingAddress.city}, ${order.shippingAddress.stateProvince} ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country}<br>
              Email: ${order.customerEmail}<br>
              Phone: ${order.shippingAddress.phoneNumber || 'N/A'}
            </td>
            <td style="width:50%; text-align:right; vertical-align:top;">
              <strong>Invoice #:</strong> ${order.id || 'N/A'}<br>
              <strong>Order ID:</strong> ${order.id || 'N/A'}<br>
              <strong>Date:</strong> ${invoiceDate}<br>
              <strong>Order Status:</strong> ${order.status}<br>
              <strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </td>
          </tr>
        </table>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; font-size: 15px;">Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width:5%; text-align:left;">#</th>
              <th style="width:45%; text-align:left;">Item Description</th>
              <th style="width:10%; text-align:right;">Qty</th>
              <th style="width:20%; text-align:right;">Unit Price</th>
              <th style="width:20%; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="clearfix">
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td style="text-align:right;">₹${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td style="text-align:right;">₹${order.shippingCost.toFixed(2)}</td>
              </tr>
              ${order.discount && order.discount > 0 ? `
              <tr>
                <td>Discount:</td>
                <td style="text-align:right;">-₹${order.discount.toFixed(2)}</td>
              </tr>` : ''}
              <tr class="grand-total" style="border-top: 2px solid #333; border-bottom: 2px solid #333;">
                <td style="padding-top: 5px; padding-bottom: 5px;">GRAND TOTAL:</td>
                <td style="text-align:right; padding-top: 5px; padding-bottom: 5px;">₹${order.grandTotal.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on: ${invoiceDateTime}</p>
        </div>
      </div>
  `;
  return htmlContent.trim();
}

/**
 * Triggers the download of the provided HTML content as an .html file.
 * @param order The order object (used for filename).
 * @param htmlContent The HTML string to download.
 */
export function downloadHtmlInvoice(order: Order, htmlContent: string) {
  if (!order || !order.id) {
    toast({
      title: 'Error Downloading Invoice',
      description: 'Order data or Order ID is not available.',
      variant: 'destructive',
    });
    return;
  }

  const blob = new Blob([`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Invoice ${order.id}</title></head><body>${htmlContent}</body></html>`], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `invoice-${order.id}.html`; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  toast({
    title: 'Invoice HTML Downloaded',
    description: `An HTML file (invoice-${order.id}.html) has been downloaded. You can open this in a browser to view the invoice.`,
    duration: 8000,
  });
}

// The old generateInvoicePdf function can be removed or kept for reference.
// For this change, we are focusing on generating HTML for viewing and downloading.
// True PDF generation remains a future enhancement.
