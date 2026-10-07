import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { updateAddress, deleteAddress, setDefaultAddress } from '@/lib/customer';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    if (body.action === 'set_default') {
      const ok = await setDefaultAddress(user.id, id);
      if (!ok) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Default address updated' });
    }

    const updated = await updateAddress(user.id, id, {
      fullName: body.fullName,
      phone: body.phone,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      isDefault: body.isDefault,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const ok = await deleteAddress(user.id, id);

    if (!ok) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Address removed' });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
