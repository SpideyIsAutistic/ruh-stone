'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ContactModal from '@/components/ContactModal';
import ProductCardImage from '@/components/ProductCardImage';
import { CraftProduct, CartItem, isProductInStock, getEffectivePrice } from '@/types';
import { ShoppingBag, MessageSquare, Check, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface ProductPageClientProps {
  product: CraftProduct;
  recommendedProducts: CraftProduct[];
}

export default function ProductPageClient({
  product,
  recommendedProducts,
}: ProductPageClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const inStock = isProductInStock(product);
  const maxStock = typeof product.stockQuantity === 'number' ? product.stockQuantity : 99;
  const effectivePrice = getEffectivePrice(product);

  const galleryList =
    product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages
      : [{ url: product.heroImage, label: 'Primary View', caption: product.shortDescription }];

  const currentGalleryImage = galleryList[activeImageIndex] || galleryList[0];

  const handleAddToCart = (itemToAdd: CraftProduct = product, qty: number = quantity) => {
    if (!isProductInStock(itemToAdd)) return;
    const itemMax = typeof itemToAdd.stockQuantity === 'number' ? itemToAdd.stockQuantity : 99;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.product.id === itemToAdd.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity = Math.min(itemMax, copy[existingIdx].quantity + qty);
        return copy;
      }
      return [...prev, { product: itemToAdd, quantity: Math.min(itemMax, qty) }];
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2200);
    setTimeout(() => setIsCartOpen(true), 300);
  };

  const handleBuyNow = () => {
    handleAddToCart(product, quantity);
  };

  const topPairing = recommendedProducts[0] || null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] selection:bg-[#D1C2AC]/50 selection:text-[#23201D]">
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 md:py-16">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="mb-8 md:mb-12">
          <ol className="flex items-center space-x-2 text-[10px] md:text-[11px] font-sans tracking-[0.24em] uppercase text-[#7A746C]">
            <li>
              <Link href="/" className="hover:text-[#23201D] transition-colors">
                RUH STONE
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/#collections" className="hover:text-[#23201D] transition-colors">
                COLLECTIONS
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-[#7A746C]">{product.category}</span>
            </li>
            <li>/</li>
            <li>
              <span className="text-[#23201D] font-medium truncate max-w-[200px] sm:max-w-none inline-block">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* 2-Column Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] w-full overflow-hidden bg-[#ECE4D6]">
              <Image
                src={currentGalleryImage.url}
                alt={currentGalleryImage.caption || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />

              {!inStock && (
                <div className="absolute top-4 left-4 bg-[#23201D]/90 text-[#FAF7F2] text-[10px] uppercase tracking-[0.24em] px-3.5 py-1.5 font-medium">
                  SOLD OUT · BESPOKE COMMISSION ONLY
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {galleryList.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryList.map((img, idx) => (
                  <button
                    key={`${img.url}-${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[4/5] overflow-hidden bg-[#ECE4D6] border transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#23201D] opacity-100 ring-1 ring-[#23201D]'
                        : 'border-[#E8E0D2] opacity-65 hover:opacity-100'
                    }`}
                    aria-label={`View angle ${idx + 1}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.label || `${product.name} detail`}
                      fill
                      sizes="120px"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Purchasing & Specifications */}
          <div className="lg:col-span-6 flex flex-col space-y-7 lg:pl-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium">
                  {product.category} · {product.origin}
                </span>

                {!inStock ? (
                  <span className="inline-flex items-center space-x-1.5 bg-[#8B3A2B]/10 border border-[#8B3A2B]/30 text-[#8B3A2B] text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B3A2B]" />
                    <span>OUT OF STOCK · MADE ON COMMISSION</span>
                  </span>
                ) : typeof product.stockQuantity === 'number' && product.stockQuantity <= 3 ? (
                  <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>ONLY {product.stockQuantity} PIECES REMAINING</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 text-[9px] uppercase tracking-wider text-[#4A6741] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A6741]" />
                    <span>IN STOCK ({product.stockQuantity ?? 10} AVAILABLE)</span>
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#23201D] font-light leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-4 font-serif">
                {product.isOnSale && product.salePrice ? (
                  <>
                    <span className="text-3xl font-medium tracking-wide text-[#8B3A2B]">
                      {product.salePrice}
                    </span>
                    <span className="text-lg text-[#7A746C] line-through">
                      {product.price}
                    </span>
                    <span className="bg-[#23201D] text-[#FAF7F2] text-[9px] font-sans uppercase tracking-[0.2em] px-2 py-0.5 font-medium">
                      SEASONAL SALE
                    </span>
                  </>
                ) : (
                  <p className="text-2xl sm:text-3xl font-medium tracking-wide text-[#23201D]">
                    {product.price}
                  </p>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] mt-2 block">
                Taxes included · Free insured white-glove shipping across India
              </span>
            </div>

            {/* Editorial Quote & Description */}
            <div className="border-t border-b border-[#E8E0D2] py-6 space-y-4">
              <p className="font-serif italic text-lg text-[#3A3027] leading-relaxed">
                &ldquo;{product.editorialQuote}&rdquo;
              </p>
              <p className="text-xs md:text-sm text-[#7A746C] font-light leading-relaxed">
                {product.longDescription}
              </p>
            </div>

            {/* Material & Craft Specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#F4EFE6] border border-[#E8E0D2]">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#7A746C] font-medium block mb-1">
                  NATURAL MATERIAL
                </span>
                <p className="text-xs font-medium text-[#23201D]">
                  {product.material}
                </p>
              </div>

              <div className="p-4 bg-[#F4EFE6] border border-[#E8E0D2]">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#7A746C] font-medium block mb-1">
                  CRAFT TECHNIQUE
                </span>
                <p className="text-xs font-medium text-[#23201D]">
                  {product.craftTechnique}
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            {inStock && (
              <div className="flex items-center space-x-6 pt-1">
                <span className="text-xs uppercase tracking-[0.2em] text-[#7A746C]">QUANTITY</span>
                <div className="flex items-center border border-[#D1C2AC]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-xs text-[#23201D] hover:bg-[#ECE4D6]"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (quantity < maxStock) setQuantity(quantity + 1);
                    }}
                    className="w-9 h-9 flex items-center justify-center text-xs text-[#23201D] hover:bg-[#ECE4D6]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Checkout Actions */}
            <div className="flex flex-col space-y-3 pt-2">
              {inStock ? (
                <>
                  <button
                    onClick={() => handleAddToCart(product, quantity)}
                    className="w-full bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] py-4 text-[11px] font-sans tracking-[0.24em] uppercase transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-[#FAF7F2]" />
                        <span>ADDED TO ATELIER CART</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 stroke-[1.4]" />
                        <span>ADD TO CART · {effectivePrice.price}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full border border-[#23201D] text-[#23201D] hover:bg-[#23201D] hover:text-[#FAF7F2] py-3.5 text-[11px] font-sans tracking-[0.22em] uppercase transition-all duration-300"
                  >
                    ACQUIRE NOW (EXPRESS CHECKOUT)
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full bg-[#5C554E]/40 text-[#FAF7F2]/70 py-4 text-[11px] font-sans tracking-[0.24em] uppercase cursor-not-allowed"
                >
                  SOLD OUT · COMMISSION ONLY
                </button>
              )}

              <button
                onClick={() => setIsContactOpen(true)}
                className="w-full text-center text-xs font-sans tracking-widest text-[#7A746C] hover:text-[#23201D] py-2 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Enquire with Atelier Concierge</span>
              </button>
            </div>

            {/* Trust & Guarantee Badges */}
            <div className="pt-6 border-t border-[#E8E0D2] grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-1">
                <Truck className="w-4 h-4 text-[#AA9B87]" />
                <span className="text-[10px] uppercase tracking-wider text-[#23201D] font-medium">
                  Complimentary Express
                </span>
                <span className="text-[9px] text-[#7A746C]">Insured across India</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#AA9B87]" />
                <span className="text-[10px] uppercase tracking-wider text-[#23201D] font-medium">
                  Authentic Artisan
                </span>
                <span className="text-[9px] text-[#7A746C]">Signed provenance card</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <RotateCcw className="w-4 h-4 text-[#AA9B87]" />
                <span className="text-[10px] uppercase tracking-wider text-[#23201D] font-medium">
                  White Glove Returns
                </span>
                <span className="text-[9px] text-[#7A746C]">14 days complimentary</span>
              </div>
            </div>

            {/* Curated Pairing Widget */}
            {topPairing && (
              <div className="pt-6 border-t border-[#E8E0D2]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#AA9B87]" />
                    RECOMMENDED COMPANION
                  </span>
                  <Link
                    href={`/products/${topPairing.slug || topPairing.id}`}
                    className="text-[10px] uppercase tracking-wider text-[#23201D] hover:text-[#AA9B87] underline underline-offset-4"
                  >
                    View Piece →
                  </Link>
                </div>

                <Link
                  href={`/products/${topPairing.slug || topPairing.id}`}
                  className="group flex items-center gap-4 p-3 bg-[#F4EFE6] border border-[#E8E0D2] hover:border-[#23201D]/40 transition-colors"
                >
                  <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-[#ECE4D6]">
                    <ProductCardImage
                      product={topPairing}
                      aspectRatio="aspect-square"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm text-[#23201D] truncate group-hover:text-[#AA9B87] transition-colors">
                      {topPairing.name}
                    </h4>
                    <p className="text-[11px] text-[#7A746C] truncate mt-0.5">
                      {topPairing.category} · {topPairing.material}
                    </p>
                    <span className="text-xs font-medium text-[#23201D] mt-1 block">
                      {topPairing.isOnSale && topPairing.salePrice ? topPairing.salePrice : topPairing.price}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Process & Provenance Story */}
        <section className="mt-24 pt-16 border-t border-[#E8E0D2]">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-2">
              PROCESS & PROVENANCE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23201D] font-light">
              The Making of {product.name}
            </h2>
            <p className="text-xs md:text-sm text-[#7A746C] mt-2 font-light">
              Shaped through generational patience, ancestral Indian heritage, and unhurried human touch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 bg-[#F4EFE6] border border-[#E8E0D2]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] font-semibold block mb-1">
                  MATERIAL SOURCING
                </span>
                <p className="text-xs md:text-sm text-[#23201D] leading-relaxed">
                  {product.theMaking.materialSourcing}
                </p>
              </div>

              <div className="p-6 bg-[#F4EFE6] border border-[#E8E0D2]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] font-semibold block mb-1">
                  HAND TECHNIQUE
                </span>
                <p className="text-xs md:text-sm text-[#23201D] leading-relaxed">
                  {product.theMaking.handTechnique}
                </p>
              </div>

              <div className="p-6 bg-[#F4EFE6] border border-[#E8E0D2]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] font-semibold block mb-1">
                  CARE & PATINA
                </span>
                <ul className="text-xs text-[#7A746C] space-y-1 list-disc list-inside">
                  {product.theMaking.careInstructions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <p className="font-serif italic text-base text-[#3A3027] pl-3 border-l-2 border-[#D1C2AC]">
                {product.theMaking.artisanNote}
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECE4D6]">
                <Image
                  src={product.theMaking.makingImage}
                  alt={`Artisan crafting ${product.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Products Grid */}
        {recommendedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#E8E0D2]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block">
                  RECOMMENDED FOR YOU
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-[#23201D] font-light mt-1">
                  Recommended Handcrafted Objects
                </h2>
              </div>
              <p className="text-xs text-[#7A746C] font-light max-w-sm">
                Complementary objects crafted with matching material honesty and quiet domestic stillness.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {recommendedProducts.map((item) => {
                const itemInStock = isProductInStock(item);
                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug || item.id}`}
                    className="group flex flex-col bg-[#FAF7F2]"
                  >
                    <div className="relative mb-3">
                      <ProductCardImage
                        product={item}
                        aspectRatio="aspect-[4/5]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {!itemInStock && (
                        <div className="absolute top-2 left-2 bg-[#23201D]/90 text-[#FAF7F2] text-[8px] uppercase tracking-widest px-2 py-0.5 font-medium">
                          Sold Out
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#7A746C] font-medium block">
                      {item.category} · {item.origin}
                    </span>
                    <h4 className="font-serif text-base text-[#23201D] group-hover:text-[#AA9B87] transition-colors mt-0.5 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#7A746C] truncate mt-0.5">
                      {item.material}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#E8E0D2]/70">
                      <span className="text-xs text-[#23201D] font-medium">
                        {item.isOnSale && item.salePrice ? item.salePrice : item.price}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[#7A746C] group-hover:text-[#23201D] transition-colors font-medium">
                        VIEW OBJECT →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer onOpenContact={() => setIsContactOpen(true)} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={(idx) => setCartItems((prev) => prev.filter((_, i) => i !== idx))}
        onUpdateQuantity={(idx, q) =>
          setCartItems((prev) => {
            const copy = [...prev];
            if (copy[idx]) copy[idx].quantity = q;
            return copy;
          })
        }
        onClearCart={() => setCartItems([])}
        onRestoreCart={(restored) => {
          setCartItems(restored);
          setIsCartOpen(true);
        }}
      />

      {/* Contact & Bespoke Commission Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        initialProduct={product}
      />
    </div>
  );
}
