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

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    let trackingData = null;
    const trackingKey = order.shiprocketAWB || order.shiprocketShipmentId;
    if (trackingKey) {
      trackingData = await getShiprocketTracking(String(trackingKey), {
        forceRefresh,
        orderId: order.id,
      });
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
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        address: order.customer.address,
        city: order.customer.city,
        pincode: order.customer.pincode,
        state: order.customer.state,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        shippingAmount: order.shippingAmount,
        discountAmount: order.discountAmount,
        total: order.total,
        totalAmount: order.totalAmount,
        shiprocketCourier: order.shiprocketCourier,
        shiprocketAWB: order.shiprocketAWB,
        shiprocketOrderId: order.shiprocketOrderId,
        trackingUrl: order.shiprocketTrackingUrl,
      },
      tracking: trackingData,
    });
  } catch (error: any) {
    console.error('Error fetching admin order tracking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tracking' },
      { status: 500 }
    );
  }
}
