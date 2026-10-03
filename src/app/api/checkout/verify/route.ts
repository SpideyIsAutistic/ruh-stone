import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderPayment, updateOrderShipping } from '@/lib/orders';
import { verifyRazorpayPayment } from '@/lib/razorpay';
import { createShiprocketOrder } from '@/lib/shiprocket';
import {
  sendEmail,
  getOrderConfirmationEmail,
  getPaymentReceiptEmail,
} from '@/lib/email';
import { markCartRecovered } from '@/lib/abandonedCart';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      body as {
        orderId: string;
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      };

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if already processed (Idempotency)
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: 'Order already marked as paid',
      });
    }

    // 1. Verify Payment Signature Server-Side
    const isValid = verifyRazorpayPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.error(
        `[Payment Verification Failed] Order: ${orderId}, RZP Order: ${razorpay_order_id}`
      );
      await updateOrderPayment(orderId, {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'failed',
      });
      return NextResponse.json(
        { error: 'Invalid payment signature. Payment verification failed.' },
        { status: 400 }
      );
    }

    // 2. Mark Order as Paid
    const updatedOrder = await updateOrderPayment(orderId, {
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: 'paid',
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // 3. Mark Abandoned Cart as Recovered (Cancel future reminder emails)
    try {
      await markCartRecovered(updatedOrder.customer.email);
    } catch (err) {
      console.warn('Error marking cart recovered:', err);
    }

    // 4. Send Confirmation & Payment Receipt Emails
    try {
      const confirmEmail = getOrderConfirmationEmail(updatedOrder);
      const receiptEmail = getPaymentReceiptEmail(updatedOrder);
      await Promise.all([sendEmail(confirmEmail), sendEmail(receiptEmail)]);
    } catch (emailErr) {
      console.error('Error sending order confirmation emails:', emailErr);
    }

    // 5. Create Shiprocket Order (Failure-safe: will not fail payment verification)
    try {
      const srResult = await createShiprocketOrder(updatedOrder);
      if (srResult.success) {
        await updateOrderShipping(orderId, {
          orderStatus: 'confirmed',
          shiprocketOrderId: srResult.orderId,
          shiprocketShipmentId: srResult.shipmentId,
          shiprocketAWB: srResult.awbCode,
          shiprocketCourier: srResult.courierName,
        });
      }
    } catch (shiprocketErr) {
      console.warn('Shiprocket order creation deferred:', shiprocketErr);
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      paymentStatus: 'paid',
    });
  } catch (error: any) {
    console.error('Error during payment verification:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
