export type CraftCategory =
  | 'All'
  | 'German Silver'
  | 'Marble'
  | 'Fibre'
  | 'Brass and Wood';

export interface CraftProduct {
  id: string;
  name: string;
  slug: string;
  category: CraftCategory;
  material: string;
  craftTechnique: string;
  origin: string;
  artisanGuild?: string;
  dimensions?: string;
  weight?: string;
  price: string;
  priceNumeric: number;
  shortDescription: string;
  editorialQuote: string;
  longDescription: string;
  heroImage: string;
  galleryImages: {
    url: string;
    label: string;
    caption: string;
  }[];
  theMaking: {
    materialSourcing: string;
    handTechnique: string;
    finishDetails: string;
    careInstructions: string[];
    artisanNote: string;
    makingImage: string;
  };
  featuredInTrio?: boolean;
  trioSubtitle?: string;
  images?: string[];
  imageFit?: 'contain' | 'cover';
  isOnSale?: boolean;
  salePrice?: string;
  salePriceNumeric?: number;
  stockQuantity?: number;
  isOutOfStock?: boolean;
}

export function isProductInStock(product: CraftProduct): boolean {
  if (product.isOutOfStock === true) return false;
  if (typeof product.stockQuantity === 'number' && product.stockQuantity <= 0) return false;
  return true;
}

export function getEffectivePrice(product: CraftProduct): {
  price: string;
  numeric: number;
  isOnSale: boolean;
} {
  if (product.isOnSale && product.salePriceNumeric && product.salePriceNumeric > 0) {
    return {
      price: product.salePrice || `₹${product.salePriceNumeric.toLocaleString('en-IN')}`,
      numeric: product.salePriceNumeric,
      isOnSale: true,
    };
  }
  return {
    price: product.price,
    numeric: product.priceNumeric,
    isOnSale: false,
  };
}

export function getProductImages(product: CraftProduct): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  const urls: string[] = [];
  if (product.heroImage) urls.push(product.heroImage);
  if (product.galleryImages && Array.isArray(product.galleryImages)) {
    product.galleryImages.forEach((g) => {
      if (g.url && !urls.includes(g.url)) {
        urls.push(g.url);
      }
    });
  }
  return urls;
}

export interface CollectionCategory {
  id: string;
  name: string;
  tagline: string;
  itemCount: number;
  image: string;
  filterCategory: CraftCategory;
}

export interface CartItem {
  product: CraftProduct;
  quantity: number;
  selectedOption?: string;
}
