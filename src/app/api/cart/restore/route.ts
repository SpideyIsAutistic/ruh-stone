import { NextRequest, NextResponse } from 'next/server';
import { getCartSessionByToken } from '@/lib/abandonedCart';
import { getAllProducts } from '@/lib/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const session = await getCartSessionByToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Cart session expired or not found' }, { status: 404 });
    }

    const allProducts = await getAllProducts();
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    const restoredItems = session.items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          product,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      items: restoredItems,
      customer: session.customer || {},
      subtotal: session.subtotal,
    });
  } catch (error: any) {
    console.error('Error restoring cart session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to restore cart session' },
      { status: 500 }
    );
  }
}
