'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCardImage from './ProductCardImage';
import { CraftProduct, CraftCategory, isProductInStock } from '@/types';

interface ShopSectionProps {
  products?: CraftProduct[];
  isLoading?: boolean;
  selectedCategory?: CraftCategory;
  onSelectCategory?: (category: CraftCategory) => void;
  onSelectProduct?: (product: CraftProduct) => void;
  onQuickAddToCart?: (product: CraftProduct) => void;
  onOpenEnquiry?: (product: CraftProduct) => void;
}

export default function ShopSection({
  products = [],
  isLoading = false,
  selectedCategory: controlledCategory,
  onSelectCategory: setControlledCategory,
  onSelectProduct,
  onQuickAddToCart,
  onOpenEnquiry,
}: ShopSectionProps) {
  const [internalCategory, setInternalCategory] = useState<CraftCategory>('All');
  const activeCategory = controlledCategory || internalCategory;
  const setActiveCategory = setControlledCategory || setInternalCategory;

  const categories: CraftCategory[] = ['All', 'German Silver', 'Marble', 'Fibre', 'Brass and Wood'];

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="shop" className="py-24 md:py-36 bg-[#FAF7F2] border-b border-[#E8E0D2]/70">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Section Header: Ventura-inspired "Shop" Title with Ample Whitespace */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-3">
            ARTISAN CATALOGUE
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#23201D] font-light tracking-tight">
            Shop
          </h2>
          <p className="text-xs md:text-sm text-[#7A746C] max-w-md mx-auto mt-4 font-light tracking-wide">
            Handmade German silver tableware, carved Makrana marble centerpieces, architectural fiber vessels, and seasoned brass and wood plinths.
          </p>

          {/* Minimal Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 mt-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[11px] font-sans tracking-[0.2em] uppercase px-3 py-1.5 transition-all duration-200 focus:outline-none ${
                  activeCategory === cat
                    ? 'text-[#23201D] font-semibold border-b border-[#23201D]'
                    : 'text-[#7A746C] hover:text-[#23201D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Loading Skeleton: Shimmer cards while Supabase query is in-flight */}
        {isLoading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12"
            aria-busy="true"
            aria-label="Loading handcrafted objects"
          >
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="flex flex-col animate-pulse">
                {/* Photo container skeleton */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ECE4D6]/70 mb-5 border border-[#E8E0D2]/40">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#E2D8C7]/40 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 w-16 h-4 bg-[#DFD5C4]/60 rounded-xs" />
                </div>
                {/* Title and metadata skeleton */}
                <div className="flex flex-col space-y-2">
                  <div className="h-5 bg-[#E8E0D2] w-3/4 rounded-xs" />
                  <div className="h-3.5 bg-[#E8E0D2]/70 w-1/2 rounded-xs" />
                  <div className="h-4 bg-[#E8E0D2]/80 w-1/4 rounded-xs pt-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Empty State: Luxury artisan message when no products exist */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="max-w-xl mx-auto py-16 px-6 text-center border border-[#E8E0D2] bg-[#FAF7F2] my-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-3">
              ATELIER ARCHIVE
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#23201D] font-light mb-3">
              {activeCategory === 'All'
                ? 'No Objects Currently Available'
                : `No Objects in ${activeCategory}`}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A746C] font-light leading-relaxed mb-8 max-w-md mx-auto">
              {activeCategory === 'All'
                ? 'Our master artisans shape every piece slowly and by hand in limited editions. Inquire with our concierge regarding bespoke commissions or upcoming atelier releases.'
                : `Our craft guilds are currently hand-shaping new pieces in ${activeCategory}. Explore all objects or reach out to our concierge for bespoke sizing.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {activeCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('All')}
                  className="bg-[#23201D] text-[#FAF7F2] text-[10px] uppercase font-sans tracking-[0.22em] px-5 py-3 font-medium hover:bg-[#3A3027] transition-colors cursor-pointer"
                >
                  VIEW ALL OBJECTS
                </button>
              )}
              <a
                href="mailto:support@ruhstone.com"
                className="border border-[#23201D] text-[#23201D] text-[10px] uppercase font-sans tracking-[0.22em] px-5 py-3 font-medium hover:bg-[#23201D] hover:text-[#FAF7F2] transition-colors"
              >
                CONTACT CONCIERGE
              </a>
            </div>
          </div>
        )}

        {/* 3. 3-Column Handcrafted Product Grid: Real Supabase Data (Ventura Benchmark Layout) */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 animate-in fade-in duration-300">
            {filteredProducts.map((product) => {
              const inStock = isProductInStock(product);
              const productHref = `/products/${product.slug || product.id}`;
              return (
                <div
                  key={product.id}
                  className="group flex flex-col"
                >
                  {/* Product Photography Container with Dual Image Hover-Swap */}
                  <div className="relative mb-5">
                    <Link href={productHref} className="block overflow-hidden" tabIndex={-1} aria-hidden="true">
                      <ProductCardImage
                        product={product}
                        aspectRatio="aspect-[4/5]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      >
                        {/* Out of Stock or On Sale Badge */}
                        {!inStock ? (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-[#5C554E] text-[#FAF7F2] text-[9px] font-sans tracking-[0.25em] uppercase px-2 py-0.5 font-medium shadow-xs">
                              SOLD OUT
                            </span>
                          </div>
                        ) : product.isOnSale ? (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-[#23201D] text-[#FAF7F2] text-[9px] font-sans tracking-[0.25em] uppercase px-2 py-0.5 font-medium shadow-xs">
                              SALE
                            </span>
                          </div>
                        ) : null}
                      </ProductCardImage>
                    </Link>

                    {/* Subtle Hover Overlay with Quick Action (Desktop) */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-end justify-between p-6 opacity-0 group-hover:opacity-100 z-20 pointer-events-none">
                      <Link
                        href={productHref}
                        className="pointer-events-auto bg-[#FAF7F2]/95 backdrop-blur-sm text-[#23201D] text-[10px] uppercase font-sans tracking-[0.2em] px-3.5 py-2 font-medium hover:bg-white transition-colors cursor-pointer inline-flex items-center"
                        aria-label={`View details for ${product.name}`}
                      >
                        {!inStock ? 'VIEW & COMMISSION' : 'VIEW DETAILS'}
                      </Link>

                      {onQuickAddToCart && (
                        !inStock ? (
                          <span
                            className="pointer-events-auto bg-[#5C554E]/90 text-[#FAF7F2]/90 text-[10px] uppercase font-sans tracking-[0.2em] px-3.5 py-2 font-medium cursor-not-allowed"
                            title="Currently out of stock"
                          >
                            SOLD OUT
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onQuickAddToCart(product);
                            }}
                            className="pointer-events-auto bg-[#23201D] text-[#FAF7F2] text-[10px] uppercase font-sans tracking-[0.2em] px-3.5 py-2 font-medium hover:bg-[#3A3027] transition-colors cursor-pointer"
                            title="Add piece to cart"
                          >
                            + ADD TO CART
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Product Info (Ventura Exact Hierarchy: Name, Short Craft Description, Price) */}
                  <div className="flex flex-col space-y-1">
                    <Link
                      href={productHref}
                      className="font-serif text-lg md:text-xl text-[#23201D] group-hover:text-[#AA9B87] transition-colors font-normal leading-snug hover:underline underline-offset-4 decoration-[#AA9B87]/50"
                    >
                      {product.name}
                    </Link>
                    <span className="text-[11px] text-[#7A746C] tracking-wide">
                      {product.material} · {product.origin}
                    </span>

                    <div className="flex items-center justify-between pt-1 font-serif">
                      <div className="flex items-center gap-2">
                        {product.isOnSale && product.salePrice ? (
                          <>
                            <span className="text-xs text-[#8B3A2B] font-semibold tracking-wider">
                              {product.salePrice}
                            </span>
                            <span className="text-xs text-[#7A746C] line-through tracking-wider">
                              {product.price}
                            </span>
                            <span className="text-[9px] text-[#8B3A2B] font-sans font-medium tracking-widest uppercase">
                              SALE
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-[#23201D] font-medium tracking-wider">
                            {product.price}
                          </span>
                        )}
                      </div>

                      {!inStock && (
                        <span className="text-[10px] uppercase font-sans tracking-widest text-[#8B3A2B] font-medium">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Dedicated Mobile Action Target (visible on small touchscreens) */}
                    <div className="sm:hidden pt-3 flex items-center justify-between border-t border-[#E8E0D2]/60 mt-2">
                      <Link
                        href={productHref}
                        className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#23201D] underline underline-offset-4 font-medium"
                      >
                        VIEW DETAILS →
                      </Link>
                      {inStock && onQuickAddToCart && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onQuickAddToCart(product);
                          }}
                          className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] hover:text-[#23201D] font-medium"
                        >
                          + ADD TO CART
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Whitespace Note */}
        <div className="mt-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#7A746C]">
            Each piece is individually numbered and shaped by master craft guilds across India.
          </p>
        </div>
      </div>
    </section>
  );
}
