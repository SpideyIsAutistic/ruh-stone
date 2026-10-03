import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orders';
import { getShiprocketTracking } from '@/lib/shiprocket';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let trackingData = null;
    const trackingKey = order.shiprocketAWB || order.shiprocketShipmentId;
    if (trackingKey) {
      trackingData = await getShiprocketTracking(String(trackingKey));
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
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
      },
      tracking: trackingData,
    });
  } catch (error: any) {
    console.error('Error fetching order tracking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order tracking' },
      { status: 500 }
    );
  }
}
