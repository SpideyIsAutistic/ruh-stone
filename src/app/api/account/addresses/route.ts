import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getAddresses, createAddress } from '@/lib/customer';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await getAddresses(user.id);
    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to retrieve addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = 'India',
      isDefault = false,
    } = body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: 'Please provide all mandatory address fields' },
        { status: 400 }
      );
    }

    const newAddress = await createAddress(user.id, {
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 ? addressLine2.trim() : '',
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json({ success: true, address: newAddress }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }
}
