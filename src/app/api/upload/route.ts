import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = (formData.getAll('files') as File[])
      .concat(formData.getAll('file') as File[])
      .filter((f) => f && typeof f !== 'string' && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let canWriteToDisk = true;

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch (e) {
      canWriteToDisk = false;
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (canWriteToDisk) {
        try {
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${safeName}`;
          const filePath = path.join(uploadsDir, filename);

          fs.writeFileSync(filePath, buffer);
          uploadedUrls.push(`/uploads/${filename}`);
          continue;
        } catch (e) {
          canWriteToDisk = false;
        }
      }

      // Resilient fallback for serverless/read-only environments
      const mime = file.type || 'image/png';
      const base64 = buffer.toString('base64');
      uploadedUrls.push(`data:${mime};base64,${base64}`);
    }

    return NextResponse.json({
      url: uploadedUrls[0],
      urls: uploadedUrls,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    );
  }
}
