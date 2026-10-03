import { NextRequest, NextResponse } from 'next/server';
import { processAbandonedCartReminders } from '@/lib/abandonedCart';

export async function GET(req: NextRequest) {
  try {
    const result = await processAbandonedCartReminders();
    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} cart sessions, sent ${result.remindersSent} reminders.`,
      result,
    });
  } catch (error: any) {
    console.error('Error running abandoned cart reminder cron:', error);
    return NextResponse.json(
      { error: error.message || 'Cron job execution failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
