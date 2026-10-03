import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import {
  getOrderById,
  getOrderByRazorpayOrderId,
  updateOrderPayment,
  updateOrderShipping,
} from '@/lib/orders';
import { createShiprocketOrder } from '@/lib/shiprocket';
import {
  sendEmail,
  getOrderConfirmationEmail,
  getPaymentReceiptEmail,
} from '@/lib/email';
import { markCartRecovered } from '@/lib/abandonedCart';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Razorpay signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('[Razorpay Webhook] Invalid signature rejected');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.log(`[Razorpay Webhook Received] Event: ${eventType}`);

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;
      const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const receipt = orderEntity?.receipt;

      let order = null;
      if (receipt) {
        order = await getOrderById(receipt);
      }
      if (!order && rzpOrderId) {
        order = await getOrderByRazorpayOrderId(rzpOrderId);
      }

      if (order) {
        // Idempotency check: if already marked paid, return OK
        if (order.paymentStatus === 'paid') {
          return NextResponse.json({ status: 'already_paid' });
        }

        const updatedOrder = await updateOrderPayment(order.id, {
          paymentId: paymentId || order.razorpayPaymentId || 'webhook_captured',
          signature,
          status: 'paid',
        });

        if (updatedOrder) {
          // Cancel abandoned cart reminder
          await markCartRecovered(updatedOrder.customer.email);

          // Dispatch confirmation emails
          try {
            await Promise.all([
              sendEmail(getOrderConfirmationEmail(updatedOrder)),
              sendEmail(getPaymentReceiptEmail(updatedOrder)),
            ]);
          } catch (e) {
            console.error('Email dispatch error in webhook:', e);
          }

          // Create Shiprocket order safely
          try {
            const srResult = await createShiprocketOrder(updatedOrder);
            if (srResult.success) {
              await updateOrderShipping(updatedOrder.id, {
                orderStatus: 'confirmed',
                shiprocketOrderId: srResult.orderId,
                shiprocketShipmentId: srResult.shipmentId,
                shiprocketAWB: srResult.awbCode,
                shiprocketCourier: srResult.courierName,
              });
            }
          } catch (srErr) {
            console.warn('Shiprocket webhook order creation deferred:', srErr);
          }
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      if (rzpOrderId) {
        const order = await getOrderByRazorpayOrderId(rzpOrderId);
        if (order && order.paymentStatus === 'pending') {
          await updateOrderPayment(order.id, {
            paymentId: paymentEntity?.id || 'failed_payment',
            status: 'failed',
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
