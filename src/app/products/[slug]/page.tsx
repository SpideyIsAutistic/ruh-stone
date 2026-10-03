import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProducts, getProductBySlug, getRecommendedProducts } from '@/lib/products';
import ProductPageClient from '@/components/ProductPageClient';
import { getEffectivePrice, isProductInStock } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Piece Not Found | RUH STONE',
      description: 'The requested handcrafted piece could not be located in our collection.',
    };
  }

  const effectivePrice = getEffectivePrice(product);
  const canonicalUrl = `https://ruhstone.com/products/${product.slug}`;
  const title = `${product.name} — ${product.category} | RUH STONE`;
  const description =
    product.shortDescription ||
    `${product.name}. Handcrafted in ${product.origin} using ${product.material}. ${product.craftTechnique}.`;

  const images = product.heroImage ? [product.heroImage] : [];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'RUH STONE',
      locale: 'en_IN',
      type: 'website',
      images: images.map((img) => ({
        url: img.startsWith('http') ? img : `https://ruhstone.com${img}`,
        width: 1200,
        height: 1200,
        alt: product.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((img) => (img.startsWith('http') ? img : `https://ruhstone.com${img}`)),
    },
    other: {
      'product:price:amount': String(effectivePrice.numeric),
      'product:price:currency': 'INR',
      'product:availability': isProductInStock(product) ? 'in stock' : 'out of stock',
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const recommendedProducts = await getRecommendedProducts(product, 4);
  const effectivePrice = getEffectivePrice(product);
  const inStock = isProductInStock(product);
  const productUrl = `https://ruhstone.com/products/${product.slug}`;
  const imageUrl = product.heroImage.startsWith('http')
    ? product.heroImage
    : `https://ruhstone.com${product.heroImage}`;

  // Structured Data: Schema.org Product & Offer
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.longDescription,
    image: [imageUrl],
    sku: `RUH-${product.id}`,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: 'RUH STONE',
    },
    material: product.material,
    countryOfOrigin: {
      '@type': 'Country',
      name: 'India',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: effectivePrice.numeric,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'RUH STONE',
      },
    },
  };

  // Structured Data: Schema.org BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ruhstone.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: 'https://ruhstone.com/#collections',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `https://ruhstone.com/?category=${encodeURIComponent(product.category)}#shop`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductPageClient
        product={product}
        recommendedProducts={recommendedProducts}
      />
    </>
  );
}
