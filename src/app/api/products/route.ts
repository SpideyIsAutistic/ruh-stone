import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CRAFT_PRODUCTS } from '@/data/craftData';
import { CraftProduct } from '@/types';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'customProducts.json');
const deletedFilePath = path.join(process.cwd(), 'src', 'data', 'deletedProductIds.json');

function getCustomProducts(): CraftProduct[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileContent || '[]');
    }
  } catch (error) {
    console.error('Error reading custom products:', error);
  }
  return [];
}

function saveCustomProducts(products: CraftProduct[]) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing custom products:', error);
  }
}

function getDeletedProductIds(): string[] {
  try {
    if (fs.existsSync(deletedFilePath)) {
      const fileContent = fs.readFileSync(deletedFilePath, 'utf8');
      return JSON.parse(fileContent || '[]');
    }
  } catch (error) {
    console.error('Error reading deleted products:', error);
  }
  return [];
}

function saveDeletedProductIds(ids: string[]) {
  try {
    fs.writeFileSync(deletedFilePath, JSON.stringify(ids, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing deleted products:', error);
  }
}

// GET all products (Base craft products + any custom products added from admin - deleted products)
export async function GET() {
  const customList = getCustomProducts();
  const deletedIds = new Set(getDeletedProductIds());

  // Map to allow custom updates to override base products if id matches
  const customMap = new Map(customList.map((p) => [p.id, p]));
  const merged: CraftProduct[] = [];

  // 1. Process base catalogue products (excluding deleted ones)
  for (const base of CRAFT_PRODUCTS) {
    if (!deletedIds.has(base.id)) {
      merged.push(customMap.get(base.id) || base);
    }
  }

  // 2. Append any custom newly created products (excluding deleted ones)
  for (const item of customList) {
    if (!deletedIds.has(item.id) && !CRAFT_PRODUCTS.some((b) => b.id === item.id)) {
      merged.unshift(item); // Show newly added products at the top of the collection
    }
  }

  return NextResponse.json(merged);
}

// POST create new product from admin panel
export async function POST(req: NextRequest) {
  try {
    const newProduct: CraftProduct = await req.json();

    if (!newProduct.name || !newProduct.price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // If an id was previously in deletedIds, unmark it
    if (newProduct.id) {
      const deletedList = getDeletedProductIds().filter((id) => id !== newProduct.id);
      saveDeletedProductIds(deletedList);
    }

    const customList = getCustomProducts();
    const updatedList = [newProduct, ...customList];
    saveCustomProducts(updatedList);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error saving new product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PUT update existing product price, sale, or details
export async function PUT(req: NextRequest) {
  try {
    const updatedProduct: CraftProduct = await req.json();

    if (!updatedProduct.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Ensure it's not marked deleted
    const deletedList = getDeletedProductIds().filter((id) => id !== updatedProduct.id);
    saveDeletedProductIds(deletedList);

    const customList = getCustomProducts();
    const existingIndex = customList.findIndex((p) => p.id === updatedProduct.id);

    if (existingIndex > -1) {
      customList[existingIndex] = updatedProduct;
    } else {
      customList.push(updatedProduct);
    }

    saveCustomProducts(customList);
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE a product permanently
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // 1. Mark id as permanently deleted in deletedProductIds.json
    const deletedList = getDeletedProductIds();
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      saveDeletedProductIds(deletedList);
    }

    // 2. Remove from customProducts.json
    const customList = getCustomProducts();
    const filtered = customList.filter((p) => p.id !== id);
    saveCustomProducts(filtered);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
