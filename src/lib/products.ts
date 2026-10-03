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

export async function getAllProducts(): Promise<CraftProduct[]> {
  const customList = getCustomProducts();
  const deletedIds = new Set(getDeletedProductIds());

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
      merged.unshift(item);
    }
  }

  return merged;
}

export async function getProductBySlug(slug: string): Promise<CraftProduct | null> {
  const all = await getAllProducts();
  const found = all.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}

export async function getProductById(id: string): Promise<CraftProduct | null> {
  const all = await getAllProducts();
  const found = all.find((p) => p.id === id);
  return found || null;
}

export async function getRecommendedProducts(
  currentProduct: CraftProduct,
  limit: number = 4
): Promise<CraftProduct[]> {
  const all = await getAllProducts();
  const others = all.filter((p) => p.id !== currentProduct.id);
  const sameCategory = others.filter((p) => p.category === currentProduct.category);
  const differentCategory = others.filter((p) => p.category !== currentProduct.category);
  return [...sameCategory, ...differentCategory].slice(0, limit);
}
