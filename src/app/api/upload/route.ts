import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // Support multiple files under 'files' or 'file'
    const files = (formData.getAll('files') as File[]).concat(
      formData.getAll('file') as File[]
    ).filter(f => f && typeof f !== 'string' && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean safe filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${safeName}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      url: uploadedUrls[0],
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}

