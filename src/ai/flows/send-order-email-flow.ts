
'use server';
/**
 * @fileOverview A Genkit flow to prepare an admin email notification for a new order.
 *
 * - sendOrderNotificationEmailFlow - Prepares email content for admin.
 * - SendOrderEmailInput - Input type for the flow.
 * - SendOrderEmailOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendOrderEmailInputSchema = z.object({
  orderId: z.string().describe('The ID of the newly placed order.'),
  customerEmail: z.string().email().describe('The email address of the customer.'),
  grandTotal: z.number().describe('The total amount of the order.'),
  adminEmail: z.string().email().describe('The email address of the admin to notify.'),
});
export type SendOrderEmailInput = z.infer<typeof SendOrderEmailInputSchema>;

const SendOrderEmailOutputSchema = z.object({
  message: z.string().describe('A confirmation message indicating the email preparation status.'),
  emailSent: z.boolean().describe('Indicates if the email was (notionally) sent.'),
  emailDetails: z.object({
    to: z.string(),
    subject: z.string(),
    body: z.string(),
  }).optional().describe('Details of the email that would be sent.')
});
export type SendOrderEmailOutput = z.infer<typeof SendOrderEmailOutputSchema>;

// Exported wrapper function to be called by the API route
export async function sendOrderNotificationEmail(input: SendOrderEmailInput): Promise<SendOrderEmailOutput> {
  return sendOrderNotificationEmailFlow(input);
}

const sendOrderNotificationEmailFlow = ai.defineFlow(
  {
    name: 'sendOrderNotificationEmailFlow',
    inputSchema: SendOrderEmailInputSchema,
    outputSchema: SendOrderEmailOutputSchema,
  },
  async (input) => {
    const { orderId, customerEmail, grandTotal, adminEmail } = input;

    const subject = `New Order Received - Order ID: ${orderId}`; // Use full order ID
    const body = `
Hello Admin,

A new order has been placed on Mens Club Keshavapatnam.

Order ID: ${orderId}
Customer Email: ${customerEmail}
Total Amount: ₹${grandTotal.toFixed(2)}

Please log in to the admin panel to view full order details and process the order:
[Link to Admin Panel: /admin/orders/view/${orderId}] (Link to be implemented)

Thank you.
    `.trim();

    // In a real application, you would integrate an email sending service here.
    // For example, using Nodemailer, SendGrid, AWS SES, etc.
    // const emailSentSuccessfully = await sendEmailService.send({ to: adminEmail, subject, body });

    console.log("---- Admin Email Notification ----");
    console.log("To:", adminEmail);
    console.log("Subject:", subject);
    console.log("Body:", body);
    console.log("----------------------------------");
    
    // This is a simulation. In a real app, `emailSent` would depend on the email service's response.
    const emailSent = true; 

    if (emailSent) {
      return {
        message: `Admin email notification for order ${orderId} prepared and logged.`,
        emailSent: true,
        emailDetails: {
            to: adminEmail,
            subject: subject,
            body: body,
        }
      };
    } else {
      return {
        message: `Failed to prepare admin email notification for order ${orderId}.`,
        emailSent: false,
      };
    }
  }
);

