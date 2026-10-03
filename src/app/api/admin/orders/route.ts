import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, updateOrderShipping } from '@/lib/orders';
import { OrderStatus } from '@/types';

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderStatus, shiprocketAWB, shiprocketCourier } = body as {
      orderId: string;
      orderStatus: OrderStatus;
      shiprocketAWB?: string;
      shiprocketCourier?: string;
    };

    if (!orderId || !orderStatus) {
      return NextResponse.json(
        { error: 'orderId and orderStatus are required' },
        { status: 400 }
      );
    }

    const updated = await updateOrderShipping(orderId, {
      orderStatus,
      shiprocketAWB,
      shiprocketCourier,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
