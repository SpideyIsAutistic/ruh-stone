import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Patron requested account deletion';

    // Log deletion request and notify atelier support
    console.log(`[Account Deletion Request] User: ${user.id} (${user.email}). Reason: ${reason}`);

    await sendEmail({
      to: 'support@ruhstone.com',
      subject: `Account Deletion Request: ${user.email}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Patron Account Deletion Request</h2>
          <p><strong>User ID:</strong> ${user.id}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Reason provided:</strong> ${reason}</p>
          <p>Please review associated orders and process GDPR/data deletion within regulatory timelines.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message:
        'Your deletion request has been submitted to the atelier team. You will receive email confirmation once processed.',
    });
  } catch (error: any) {
    console.error('Account deletion request error:', error);
    return NextResponse.json({ error: 'Failed to submit deletion request' }, { status: 500 });
  }
}
