import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderShipping } from '@/lib/orders';
import { OrderStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Shiprocket Webhook Received]', body);

    const orderId = body.order_id || body.channel_order_id;
    const currentStatus = String(body.current_status || '').toUpperCase();
    const awb = body.awb || body.awb_code;
    const courier = body.courier_name;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let mappedStatus: OrderStatus = order.orderStatus;
    if (currentStatus.includes('DELIVERED')) {
      mappedStatus = 'delivered';
    } else if (
      currentStatus.includes('IN TRANSIT') ||
      currentStatus.includes('SHIPPED') ||
      currentStatus.includes('DISPATCHED') ||
      currentStatus.includes('OUT FOR DELIVERY')
    ) {
      mappedStatus = 'shipped';
    } else if (currentStatus.includes('CANCEL')) {
      mappedStatus = 'cancelled';
    }

    await updateOrderShipping(order.id, {
      orderStatus: mappedStatus,
      shiprocketAWB: awb || order.shiprocketAWB,
      shiprocketCourier: courier || order.shiprocketCourier,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling Shiprocket webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook failed' },
      { status: 500 }
    );
  }
}
