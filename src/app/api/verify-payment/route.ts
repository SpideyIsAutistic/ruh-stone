import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRazorpayKeys } from '@/lib/razorpay';
import { getOrderByRazorpayOrderId, updateOrderPayment } from '@/lib/orders';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendEmail, getOrderConfirmationEmail, getPaymentReceiptEmail } from '@/lib/email';
import { markCartRecovered } from '@/lib/abandonedCart';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both razorpay prefixed and un-prefixed parameter keys
    const order_id = body.razorpay_order_id || body.order_id;
    const payment_id = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    // Validate missing fields: return 400
    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: order_id, payment_id, and signature are required',
        },
        { status: 400 }
      );
    }

    const { keySecret } = getRazorpayKeys();
    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: 'Razorpay secret key is not configured' },
        { status: 500 }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(signature, 'utf8');

    const isMatch =
      expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);

    // Signature mismatch: return 400, do NOT mark as paid
    if (!isMatch) {
      console.warn(`[Razorpay Signature Mismatch] Order: ${order_id}, Payment: ${payment_id}`);
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // On signature match: check if an existing store order matches this Razorpay order
    try {
      const existingOrder = await getOrderByRazorpayOrderId(order_id);
      if (existingOrder && existingOrder.paymentStatus !== 'paid') {
        const updatedOrder = await updateOrderPayment(existingOrder.id, {
          paymentId: payment_id,
          signature: signature,
          status: 'paid',
        });

        if (updatedOrder) {
          Promise.allSettled([
            sendEmail(getOrderConfirmationEmail(updatedOrder)),
            sendEmail(getPaymentReceiptEmail(updatedOrder)),
            createShiprocketOrder(updatedOrder),
            markCartRecovered(updatedOrder.customer.email),
          ]).catch((err) => console.error('Post-payment tasks error:', err));
        }
      }
    } catch (dbErr) {
      console.error('Error updating order on payment verification:', dbErr);
    }

    // Return success only if signatures match
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order_id,
      payment_id,
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
