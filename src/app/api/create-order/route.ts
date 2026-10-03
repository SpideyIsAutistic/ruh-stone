import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, getRazorpayKeys } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount: Minimum amount 100 paise
    if (
      amount === undefined ||
      amount === null ||
      typeof amount !== 'number' ||
      isNaN(amount) ||
      amount < 100
    ) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise' },
        { status: 400 }
      );
    }

    const { keyId, keySecret, isConfigured } = getRazorpayKeys();
    if (!isConfigured || !keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Authentication failed: Razorpay credentials are not configured' },
        { status: 401 }
      );
    }

    const order = await createRazorpayOrder({
      amountInPaise: amount,
      currency,
      receipt,
      notes,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: keyId,
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);

    // Handle authentication failures (return 401)
    if (
      error?.statusCode === 401 ||
      error?.status === 401 ||
      error?.error?.description?.toLowerCase().includes('authentication failed') ||
      error?.message?.toLowerCase().includes('authentication')
    ) {
      return NextResponse.json(
        { error: error?.error?.description || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Handle bad request from Razorpay
    if (error?.statusCode === 400 || error?.status === 400) {
      return NextResponse.json(
        { error: error?.error?.description || error?.message || 'Bad request' },
        { status: 400 }
      );
    }

    // Handle other Razorpay API errors (return 500)
    return NextResponse.json(
      { error: error?.error?.description || error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
