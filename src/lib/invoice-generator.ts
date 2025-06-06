
// @/lib/invoice-generator.ts
'use client';

import type { Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

/**
 * Generates an HTML string snippet for the invoice content, including styles.
 * This snippet is intended to be injected into a container div for modal preview.
 * It returns ONLY the <style> block and the main content <div>.
 * @param order The order object.
 * @returns An HTML string (styles + content div).
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
        <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
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

  // HTML snippet for injection (NO full <html>, <head>, <body> here)
  // Outer padding is removed, will be handled by modal's ScrollArea wrapper
  const htmlSnippet = `
      <style>
        .invoice-content-wrapper { font-family: 'Arial', sans-serif; color: #333; background-color: #fff; /* Removed outer padding */ }
        .invoice-content-wrapper .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .invoice-content-wrapper .header h1 { margin: 0; color: #333; font-size: 22px; }
        .invoice-content-wrapper .store-details p { margin: 2px 0; font-size: 11px; }
        .invoice-content-wrapper .invoice-details-table, .invoice-content-wrapper .customer-details-table { margin-bottom: 15px; font-size: 13px; width: 100%; }
        .invoice-content-wrapper .invoice-details-table td, .invoice-content-wrapper .customer-details-table td { padding: 4px; text-align: left; }
        .invoice-content-wrapper .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px; }
        .invoice-content-wrapper .items-table th { background-color: #f0f0f0; border: 1px solid #ddd; padding: 8px; text-align: left; }
        .invoice-content-wrapper .items-table td { border: 1px solid #ddd; padding: 6px; }
        .invoice-content-wrapper .totals { float: right; width: 45%; margin-top: 15px; font-size: 13px; }
        .invoice-content-wrapper .totals table { width: 100%; }
        .invoice-content-wrapper .totals td { padding: 4px; }
        .invoice-content-wrapper .totals .grand-total { font-weight: bold; font-size: 15px; }
        .invoice-content-wrapper .footer { text-align: center; margin-top: 25px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #777; }
        .invoice-content-wrapper .clearfix::after { content: ""; clear: both; display: table; }
      </style>
      <div class="invoice-content-wrapper" id="invoiceToPrint-${order.id}">
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
  return htmlSnippet.trim();
}

/**
 * Triggers the download of the provided HTML snippet as a complete .html file.
 * @param order The order object (used for filename).
 * @param invoiceHtmlContent The HTML snippet (styles + content div) generated by generateInvoiceHTML.
 */
export function downloadHtmlInvoice(order: Order, invoiceHtmlSnippet: string) {
  if (!order || !order.id) {
    toast({
      title: 'Error Downloading Invoice',
      description: 'Order data or Order ID is not available.',
      variant: 'destructive',
    });
    return;
  }

  // Extract <style>...</style> block
  const styleMatch = invoiceHtmlSnippet.match(/<style>([\s\S]*?)<\/style>/);
  const styleContent = styleMatch ? styleMatch[0] : '<style></style>'; // Includes the <style> tags

  // Extract content after the first </style> tag, which should be the main invoice <div>
  const bodyContentStartIndex = invoiceHtmlSnippet.indexOf('</style>') + '</style>'.length;
  const bodyContent = invoiceHtmlSnippet.substring(bodyContentStartIndex).trim();
  
  const finalHtmlDocument = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${order.id}</title>
      ${styleContent}
    </head>
    <body>
      ${bodyContent}
    </body>
    </html>
  `;

  const blob = new Blob([finalHtmlDocument], { type: 'text/html' });
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

// Placeholder for actual PDF generation - this function is not directly called by the modal anymore
// but is kept for conceptual reference.
export async function generateAndDownloadPdfInvoice(order: Order | null) {
  if (!order || !order.id) {
    toast({
      title: 'Error Simulating Invoice',
      description: 'Order data or Order ID is not available.',
      variant: 'destructive',
    });
    return;
  }
  console.log(`--- PDF Invoice Generation would be triggered here for Order: ${order.id} ---`);
  console.log("To implement actual PDF generation, you would use libraries like jsPDF combined with html2canvas or html2pdf.js.");
  console.log("Example (Conceptual - requires library installation and integration):");
  console.log(`
    // import jsPDF from 'jspdf';
    // import html2canvas from 'html2canvas';
    // const invoiceElement = document.getElementById('invoiceToPrint-${order.id}'); // Assuming the HTML is rendered
    // if (invoiceElement) {
    //   html2canvas(invoiceElement).then(canvas => {
    //     const imgData = canvas.toDataURL('image/png');
    //     const pdf = new jsPDF();
    //     const imgProps = pdf.getImageProperties(imgData);
    //     const pdfWidth = pdf.internal.pageSize.getWidth();
    //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    //     pdf.save('invoice-${order.id}.pdf');
    //   });
    // }
  `);
   toast({
    title: 'PDF Invoice Simulated',
    description: `This is a placeholder. Actual PDF generation for order ${order.id} requires further development with PDF libraries. An HTML version can be downloaded from the modal view.`,
    duration: 10000,
  });
}
