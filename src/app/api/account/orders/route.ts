import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getCustomerOrders, getCustomerOrderStats } from '@/lib/customer';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [orders, stats] = await Promise.all([
      getCustomerOrders(user.id),
      getCustomerOrderStats(user.id),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}
