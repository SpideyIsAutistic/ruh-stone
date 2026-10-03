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
  sku?: string;
  isPublished?: boolean;
  status?: 'published' | 'draft';
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

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state?: string;
  country?: string;
  giftNote?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  heroImage: string;
  priceNumeric: number;
  priceFormatted: string;
  quantity: number;
  material?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: 'INR';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  shiprocketOrderId?: number | string;
  shiprocketShipmentId?: number | string;
  shiprocketAWB?: string;
  shiprocketCourier?: string;
  shiprocketTrackingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbandonedCartSession {
  id: string; // secure token
  email: string;
  customer?: Partial<CustomerInfo>;
  items: Array<{
    productId: string;
    quantity: number;
    priceNumeric: number;
  }>;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  recovered: boolean;
  reminderSentCount: number;
  lastReminderAt?: string;
}

