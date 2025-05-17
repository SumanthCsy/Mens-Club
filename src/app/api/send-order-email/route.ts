
// @/app/api/send-order-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotificationEmail } from '@/ai/flows/send-order-email-flow'; // Adjust path as needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerEmail, grandTotal, adminEmail } = body;

    if (!orderId || !customerEmail || typeof grandTotal !== 'number' || !adminEmail) {
      return NextResponse.json({ message: 'Missing required fields in request body for email notification.' }, { status: 400 });
    }

    // Call the Genkit flow
    const result = await sendOrderNotificationEmail({
        orderId,
        customerEmail,
        grandTotal,
        adminEmail
    });

    if (result.emailSent) {
      return NextResponse.json({ message: result.message, details: result.emailDetails }, { status: 200 });
    } else {
      // This case is currently not reached by the flow, but kept for completeness
      return NextResponse.json({ message: result.message || "Genkit flow indicated email was not sent.", error: "Flow execution issue during email preparation." }, { status: 500 });
    }

  } catch (error) {
    console.error('API error sending order email notification:', error);
    let errorMessage = 'Internal Server Error while preparing email notification.';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        errorMessage = 'An unknown error occurred in the email notification API.';
    }
    return NextResponse.json({ message: 'Failed to process email notification via API.', error: errorMessage }, { status: 500 });
  }
}
