
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
function generateInvoiceHTML(order: Order): string {
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

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${order.id}</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
        .invoice-container { max-width: 800px; margin: 20px auto; background-color: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #333; font-size: 24px; }
        .store-details p { margin: 2px 0; font-size: 12px; }
        .invoice-details, .customer-details { margin-bottom: 20px; font-size: 14px; }
        .invoice-details table, .customer-details table { width: 100%; border-collapse: collapse; }
        .invoice-details th, .invoice-details td, .customer-details th, .customer-details td { padding: 5px; text-align: left; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
        .items-table th { background-color: #f0f0f0; border: 1px solid #ddd; padding: 10px; text-align: left; }
        .items-table td { border: 1px solid #ddd; padding: 8px; }
        .totals { float: right; width: 40%; margin-top: 20px; font-size: 14px; }
        .totals table { width: 100%; }
        .totals td { padding: 5px; }
        .totals .grand-total { font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777; }
        .clearfix::after { content: ""; clear: both; display: table; }
      </style>
    </head>
    <body>
      <div class="invoice-container" id="invoiceToPrint">
        <div class="header">
          <h1>${storeName}</h1>
          <div class="store-details">
            <p>${storeAddress}</p>
            <p>${storeContact}</p>
          </div>
        </div>

        <table style="width:100%; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="width:50%;">
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
              <strong>Invoice #:</strong> ${order.id}<br>
              <strong>Order ID:</strong> ${order.id}<br>
              <strong>Date:</strong> ${invoiceDate}<br>
              <strong>Order Status:</strong> ${order.status}<br>
              <strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </td>
          </tr>
        </table>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; font-size: 16px;">Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width:5%;">#</th>
              <th style="width:45%;">Item Description</th>
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
            <table style="width:100%;">
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
    </body>
    </html>
  `;
  return htmlContent.trim();
}

/**
 * Simulates invoice generation by creating an HTML representation and
 * triggering a download of an .html file.
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

  const invoiceHtmlContent = generateInvoiceHTML(order);

  // Create a Blob with the HTML content, set MIME type to text/html
  const blob = new Blob([invoiceHtmlContent], { type: 'text/html' });

  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `invoice-${order.id}.html`; // Filename for the download with .html extension

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href); // Clean up the object URL

  toast({
    title: 'Invoice HTML Downloaded',
    description: `An HTML file (invoice-${order.id}.html) has been downloaded. You can open this in a browser to view the invoice structure. For true PDF generation, further steps are needed.`,
    duration: 12000,
  });

  // Log to console as well, for developer reference
  console.log(`--- Simulated HTML Invoice Generation & Download (as .html) for Order: ${order.id} ---`);
  console.log("To implement actual PDF generation from this HTML, you would typically use a library like jsPDF combined with html2canvas or html2pdf.js.");
  console.log("Example (conceptual, requires libraries to be installed and imported):");
  console.log(`
    // 1. Add libraries: npm install jspdf html2canvas
    // 2. Import: import jsPDF from 'jspdf'; import html2canvas from 'html2canvas';
    // 3. Logic in a function:
    // const input = document.getElementById('invoiceToPrint'); // Assuming your HTML is rendered or available
    // if (input) {
    //   html2canvas(input, { scale: 2 }) // Higher scale for better quality
    //     .then((canvas) => {
    //       const imgData = canvas.toDataURL('image/png');
    //       const pdf = new jsPDF({
    //         orientation: 'portrait',
    //         unit: 'pt', // points, pixels won't work well
    //         format: 'a4'
    //       });
    //       const pdfWidth = pdf.internal.pageSize.getWidth();
    //       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    //       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    //       pdf.save(\`invoice-${order.id}.pdf\`);
    //     });
    // } else {
    //   console.error("Invoice HTML element not found");
    // }
  `);
}
