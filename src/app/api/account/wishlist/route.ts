import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/customer';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await getWishlist(user.id);
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to retrieve wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await addToWishlist(user.id, productId);
    return NextResponse.json({ success: true, message: 'Added to wishlist' });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await removeFromWishlist(user.id, productId);
    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
