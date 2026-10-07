import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getProfile, upsertProfile } from '@/lib/customer';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await getProfile(user.id);
    if (!profile) {
      // Create initial profile record if not existing
      profile = await upsertProfile(user.id, {
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, avatarUrl } = body;

    const updated = await upsertProfile(user.id, {
      fullName: typeof fullName === 'string' ? fullName.trim() : undefined,
      phone: typeof phone === 'string' ? phone.trim() : undefined,
      avatarUrl: typeof avatarUrl === 'string' ? avatarUrl.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...updated,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
