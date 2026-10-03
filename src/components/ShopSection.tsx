'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ProductCardImage from './ProductCardImage';
import { CraftProduct, CraftCategory, isProductInStock } from '@/types';
import { CRAFT_PRODUCTS } from '@/data/craftData';

interface ShopSectionProps {
  products?: CraftProduct[];
  selectedCategory?: CraftCategory;
  onSelectCategory?: (category: CraftCategory) => void;
  onSelectProduct: (product: CraftProduct) => void;
  onQuickAddToCart?: (product: CraftProduct) => void;
}

export default function ShopSection({
  products = CRAFT_PRODUCTS,
  selectedCategory: controlledCategory,
  onSelectCategory: setControlledCategory,
  onSelectProduct,
  onQuickAddToCart,
}: ShopSectionProps) {
  const [internalCategory, setInternalCategory] = useState<CraftCategory>('All');
  const activeCategory = controlledCategory || internalCategory;
  const setActiveCategory = setControlledCategory || setInternalCategory;

  const categories: CraftCategory[] = ['All', 'German Silver', 'Marble', 'Fibre'];

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
            Handmade German silver tableware, carved Makrana marble centerpieces, and architectural fiber vessels shaped by master artisans.
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

        {/* 3-Column Handcrafted Product Grid (Ventura Benchmark Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {filteredProducts.map((product) => {
            const inStock = isProductInStock(product);
            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group cursor-pointer flex flex-col"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectProduct(product);
                }}
                aria-label={`View details for ${product.name}`}
              >
                {/* Product Photography Container with Dual Image Hover-Swap */}
                <ProductCardImage
                  product={product}
                  aspectRatio="aspect-[4/5]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="mb-5"
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

                  {/* Subtle Hover Overlay with Quick Action */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-end justify-between p-6 opacity-0 group-hover:opacity-100">
                    <span className="bg-[#FAF7F2]/90 backdrop-blur-sm text-[#23201D] text-[10px] uppercase font-sans tracking-[0.2em] px-3.5 py-2 font-medium">
                      {!inStock ? 'VIEW & COMMISSION' : 'VIEW DETAILS'}
                    </span>

                    {onQuickAddToCart && (
                      !inStock ? (
                        <span
                          className="bg-[#5C554E]/90 text-[#FAF7F2]/90 text-[10px] uppercase font-sans tracking-[0.2em] px-3.5 py-2 font-medium cursor-not-allowed"
                          title="Currently out of stock"
                        >
                          SOLD OUT
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAddToCart(product);
                          }}
                          className="bg-[#23201D] text-[#FAF7F2] text-[10px] uppercase font-sans tracking-[0.2em] px-3.5 py-2 font-medium hover:bg-[#3A3027] transition-colors"
                          title="Add piece to cart"
                        >
                          + ADD TO CART
                        </button>
                      )
                    )}
                  </div>
                </ProductCardImage>

                {/* Product Info (Ventura Exact Hierarchy: Name, Short Craft Description, Price) */}
                <div className="flex flex-col space-y-1">
                  <h3 className="font-serif text-lg md:text-xl text-[#23201D] group-hover:text-[#AA9B87] transition-colors font-normal leading-snug">
                    {product.name}
                  </h3>
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
                </div>
              </div>
            );
          })}
        </div>

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
