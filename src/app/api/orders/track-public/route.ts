import { NextRequest, NextResponse } from 'next/server';
import { verifyAndGetOrder } from '@/lib/customer';
import { getShiprocketTracking } from '@/lib/shiprocket';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, contact } = body;

    if (!orderNumber || !contact) {
      return NextResponse.json(
        { error: 'Please enter both your Order Number and the Email or Phone used during acquisition.' },
        { status: 400 }
      );
    }

    const order = await verifyAndGetOrder(orderNumber, contact);
    if (!order) {
      return NextResponse.json(
        { error: 'No order could be located matching those details. Please verify your reference and contact number/email.' },
        { status: 404 }
      );
    }

    let trackingData = null;
    const trackingKey = order.shiprocketAWB || order.shiprocketShipmentId;
    if (trackingKey) {
      trackingData = await getShiprocketTracking(String(trackingKey), { orderId: order.id });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber || order.id,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        customerName: order.customer.name,
        city: order.customer.city,
        pincode: order.customer.pincode,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        shiprocketCourier: order.shiprocketCourier,
        shiprocketAWB: order.shiprocketAWB,
        shiprocketOrderId: order.shiprocketOrderId,
      },
      tracking: trackingData,
    });
  } catch (error: any) {
    console.error('Track public order error:', error);
    return NextResponse.json({ error: 'Failed to verify order consignment' }, { status: 500 });
  }
}
