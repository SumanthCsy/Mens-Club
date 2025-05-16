
// @/app/api/send-order-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotificationEmail } from '@/ai/flows/send-order-email-flow'; // Adjust path as needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerEmail, grandTotal, adminEmail } = body;

    if (!orderId || !customerEmail || typeof grandTotal !== 'number' || !adminEmail) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
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
      return NextResponse.json({ message: result.message }, { status: 500 });
    }

  } catch (error) {
    console.error('API error sending order email:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Failed to process email notification', error: errorMessage }, { status: 500 });
  }
}
