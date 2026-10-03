import { NextRequest, NextResponse } from 'next/server';
import { captureCartSession } from '@/lib/abandonedCart';
import { CustomerInfo } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, items, customer, subtotal } = body as {
      email: string;
      items: Array<{ productId: string; quantity: number; priceNumeric: number }>;
      customer?: Partial<CustomerInfo>;
      subtotal: number;
    };

    if (!email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Email and at least one piece in cart are required' },
        { status: 400 }
      );
    }

    const token = await captureCartSession({
      email,
      items,
      customer,
      subtotal,
    });

    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    console.error('Error capturing cart:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to capture cart session' },
      { status: 500 }
    );
  }
}
