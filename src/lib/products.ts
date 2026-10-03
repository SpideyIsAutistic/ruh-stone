import { CraftProduct } from '@/types';
import { dbGetProducts, dbGetProductBySlug, dbGetProductById } from '@/lib/db';

export async function getAllProducts(options?: { includeDrafts?: boolean }): Promise<CraftProduct[]> {
  return dbGetProducts(options);
}

export async function getProductBySlug(slug: string): Promise<CraftProduct | null> {
  return dbGetProductBySlug(slug);
}

export async function getProductById(id: string): Promise<CraftProduct | null> {
  return dbGetProductById(id);
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
