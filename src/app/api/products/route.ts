import { NextRequest, NextResponse } from 'next/server';
import { dbGetProducts, dbCreateProduct, dbUpdateProduct, dbDeleteProduct } from '@/lib/db';
import { CraftProduct } from '@/types';

// GET all products from persistent database
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    const products = await dbGetProducts({ includeDrafts });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('[API Products GET Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products from database' },
      { status: 500 }
    );
  }
}

// POST create new product in persistent database
export async function POST(req: NextRequest) {
  try {
    const body: CraftProduct = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const id = body.id || `${slug}-${Date.now()}`;

    const newProduct: CraftProduct = {
      ...body,
      id,
      slug,
      sku: body.sku || `RUH-${id}`,
      isPublished: body.isPublished !== false,
      status: body.status || 'published',
    };

    const savedProduct = await dbCreateProduct(newProduct);
    return NextResponse.json({ success: true, product: savedProduct });
  } catch (error: any) {
    console.error('[API Products POST Error]', error);
    return NextResponse.json(
      { error: error.message || 'Database write failed. Product could not be saved.' },
      { status: 500 }
    );
  }
}

// PUT update existing product in persistent database
export async function PUT(req: NextRequest) {
  try {
    const body: CraftProduct = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
    }

    const updated = await dbUpdateProduct(body);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('[API Products PUT Error]', error);
    return NextResponse.json(
      { error: error.message || 'Database update failed. Changes could not be saved.' },
      { status: 500 }
    );
  }
}

// DELETE product permanently from persistent database
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await dbDeleteProduct(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('[API Products DELETE Error]', error);
    return NextResponse.json(
      { error: error.message || 'Database delete failed. Product could not be removed.' },
      { status: 500 }
    );
  }
}
