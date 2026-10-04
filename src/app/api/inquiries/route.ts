import { NextRequest, NextResponse } from 'next/server';
import { getAllInquiries, saveInquiry, updateInquiryStatus, deleteInquiry } from '@/lib/inquiries';
import { InquiryStatus } from '@/types';

// GET all atelier inquiries
export async function GET() {
  try {
    const list = await getAllInquiries();
    return NextResponse.json(list);
  } catch (error: any) {
    console.error('[API Inquiries GET Error]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// POST submit new patron inquiry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, inquiryType, message, productId, productName } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message / inquiry details are required' }, { status: 400 });
    }

    const saved = await saveInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      inquiryType: inquiryType || 'Artisan Commission',
      message: message.trim(),
      productId: productId || undefined,
      productName: productName || undefined,
      status: 'new',
    });

    return NextResponse.json({ success: true, inquiry: saved });
  } catch (error: any) {
    console.error('[API Inquiries POST Error]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

// PATCH update inquiry status or notes
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body as {
      id: string;
      status?: InquiryStatus;
      notes?: string;
    };

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    const updated = await updateInquiryStatus(id, { status, notes });
    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: any) {
    console.error('[API Inquiries PATCH Error]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

// DELETE inquiry
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    await deleteInquiry(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('[API Inquiries DELETE Error]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
