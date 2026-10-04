'use client';

import React, { useState, useEffect } from 'react';
import SafeImage from './SafeImage';
import Link from 'next/link';
import ProductCardImage from './ProductCardImage';
import { X, Check, ShoppingBag, MessageSquare, Sparkles } from 'lucide-react';
import { CraftProduct, isProductInStock } from '@/types';
import { CRAFT_PRODUCTS } from '@/data/craftData';

interface ProductDetailModalProps {
  product: CraftProduct | null;
  allProducts?: CraftProduct[];
  onClose: () => void;
  onAddToCart: (product: CraftProduct, quantity: number) => void;
  onOpenEnquiry: (product: CraftProduct) => void;
  onSelectRelated: (product: CraftProduct) => void;
}

export default function ProductDetailModal({
  product,
  allProducts,
  onClose,
  onAddToCart,
  onOpenEnquiry,
  onSelectRelated,
}: ProductDetailModalProps) {
  const modalContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      setAddedSuccess(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (!product) return;
      const count = product.galleryImages?.length || (product.images?.length || 1);
      if (e.key === 'ArrowRight' && count > 1) {
        setActiveImageIndex((prev) => (prev + 1) % count);
      }
      if (e.key === 'ArrowLeft' && count > 1) {
        setActiveImageIndex((prev) => (prev - 1 + count) % count);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, product]);

  if (!product) return null;

  const inStock = isProductInStock(product);
  const maxStock = typeof product.stockQuantity === 'number' ? product.stockQuantity : 99;

  const handleAdd = () => {
    if (!inStock) return;
    onAddToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2200);
  };

  const handleSelectProduct = (newProduct: CraftProduct) => {
    onSelectRelated(newProduct);
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeCatalog = allProducts && allProducts.length > 0 ? allProducts : CRAFT_PRODUCTS;

  // Recommended products: products in same category first, followed by others, excluding current product
  const recommendedProducts = React.useMemo(() => {
    if (!product) return [];
    const others = activeCatalog.filter((p) => p.id !== product.id);
    const sameCategory = others.filter((p) => p.category === product.category);
    const differentCategory = others.filter((p) => p.category !== product.category);
    return [...sameCategory, ...differentCategory].slice(0, 4);
  }, [product, activeCatalog]);

  const topPairing = recommendedProducts[0] || null;

  const fallbackCover = product.heroImage || (product.images && product.images[0]) || '/images/atelier-carving.jpg';
  const galleryList = (product.galleryImages && product.galleryImages.length > 0)
    ? product.galleryImages
    : (product.images && product.images.length > 0)
    ? product.images.map((url, i) => ({
        url,
        label: i === 0 ? 'Primary Angle' : `Detail Angle ${i + 1}`,
        caption: product.shortDescription || `${product.name} detail view.`,
      }))
    : [{ url: fallbackCover, label: 'Primary View', caption: product.shortDescription || product.name }];

  const safeIndex = Math.min(Math.max(0, activeImageIndex), galleryList.length - 1);
  const currentGalleryImage = galleryList[safeIndex] || galleryList[0] || {
    url: fallbackCover,
    label: product.name,
    caption: product.shortDescription || '',
  };

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-[70] overflow-y-auto bg-[#FAF7F2] animate-in fade-in duration-300"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E0D2] px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] md:text-[11px] font-sans tracking-[0.24em] uppercase text-[#7A746C]">
          <span>RUH STONE</span>
          <span>/</span>
          <span>COLLECTION</span>
          <span>/</span>
          <span className="text-[#23201D] font-medium">{product.name}</span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-[11px] font-sans tracking-[0.2em] uppercase text-[#23201D] hover:text-[#AA9B87] transition-colors p-1"
          aria-label="Close product view"
        >
          <span className="hidden sm:inline">CLOSE</span>
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>
      </header>

      {/* Main Container */}
      <div className="max-w-[1300px] mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* Two-Column Detail Layout: Large Product Photography Left, Specs Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Image Gallery (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            {/* Primary Large Image - Responsive Ratio to prevent pushing content off screen on mobile */}
            <div className="group relative aspect-[4/3] sm:aspect-[4/5] w-full max-h-[380px] lg:max-h-[640px] overflow-hidden bg-[#ECE4D6]">
              <SafeImage
                src={currentGalleryImage.url}
                alt={currentGalleryImage.label || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-all duration-700"
              />

              {/* Sold Out Overlay Badge */}
              {!inStock && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#5C554E] text-[#FAF7F2] text-[10px] font-sans tracking-[0.25em] uppercase px-3 py-1 font-medium shadow-md">
                    SOLD OUT
                  </span>
                </div>
              )}

              {/* Angle Counter Badge */}
              {galleryList.length > 1 && (
                <div className="absolute top-4 right-4 z-10 bg-[#23201D]/75 backdrop-blur-sm text-[#FAF7F2] text-[10px] uppercase tracking-[0.2em] px-2.5 py-1">
                  Angle {safeIndex + 1} of {galleryList.length}
                </div>
              )}

              {/* Prev / Next Controls over Main Image */}
              {galleryList.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev - 1 + galleryList.length) % galleryList.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FAF7F2]/90 hover:bg-[#FAF7F2] text-[#23201D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[#E8E0D2] shadow-sm focus:outline-none focus:ring-0 focus-visible:outline-none"
                    aria-label="Previous angle"
                  >
                    ←
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev + 1) % galleryList.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FAF7F2]/90 hover:bg-[#FAF7F2] text-[#23201D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[#E8E0D2] shadow-sm focus:outline-none focus:ring-0 focus-visible:outline-none"
                    aria-label="Next angle"
                  >
                    →
                  </button>
                </>
              )}

              {/* Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 text-[#FAF7F2]">
                <p className="text-[10px] tracking-[0.2em] uppercase font-medium opacity-80">
                  {currentGalleryImage.label || product.name}
                </p>
                <p className="text-xs md:text-sm font-light mt-0.5 max-w-lg">
                  {currentGalleryImage.caption || product.shortDescription || ''}
                </p>
              </div>
            </div>

            {/* Thumbnail Selectors (Visible when multiple photos exist) */}
            {galleryList.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {galleryList.map((img, idx) => {
                  if (!img || !img.url) return null;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[4/5] overflow-hidden bg-[#ECE4D6] border-2 transition-all focus:outline-none focus:ring-0 focus-visible:outline-none ${
                        safeIndex === idx
                          ? 'border-[#23201D] opacity-100 shadow-xs'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`View angle ${idx + 1}`}
                    >
                      <SafeImage
                        src={img.url}
                        alt={img.label || `${product.name} angle ${idx + 1}`}
                        fill
                        sizes="15vw"
                        className="object-cover object-center"
                      />
                      <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-[#FAF7F2] bg-black/60 px-1 py-0.2">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Handcrafted Details, Pricing & Purchase Actions */}
          <div className="lg:col-span-6 flex flex-col space-y-7 lg:pl-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium">
                  {product.category} · {product.origin}
                </span>

                {/* Real-time Inventory Status Badge */}
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

              <h1 className="font-serif text-3xl sm:text-4xl text-[#23201D] font-light leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-3 font-serif">
                {product.isOnSale && product.salePrice ? (
                  <>
                    <span className="text-2xl font-medium tracking-wide text-[#8B3A2B]">
                      {product.salePrice}
                    </span>
                    <span className="text-base text-[#7A746C] line-through">
                      {product.price}
                    </span>
                    <span className="bg-[#23201D] text-[#FAF7F2] text-[9px] font-sans uppercase tracking-[0.2em] px-2 py-0.5 font-medium">
                      SALE
                    </span>
                  </>
                ) : (
                  <p className="text-xl font-medium tracking-wide text-[#23201D]">
                    {product.price}
                  </p>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] mt-1.5 block">
                Taxes included · Free white-glove shipping across India
              </span>
            </div>

            {/* Editorial Description & Quote */}
            <div className="border-t border-b border-[#E8E0D2] py-6 space-y-4">
              <p className="font-serif italic text-base text-[#3A3027] leading-relaxed">
                &ldquo;{product.editorialQuote}&rdquo;
              </p>
              <p className="text-xs md:text-sm text-[#7A746C] font-light leading-relaxed">
                {product.longDescription}
              </p>
            </div>

            {/* Material & Craft Technique Specs */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-medium block mb-1">
                  NATURAL MATERIAL
                </span>
                <p className="text-xs md:text-sm font-medium text-[#23201D]">
                  {product.material}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-medium block mb-1">
                  CRAFT TECHNIQUE
                </span>
                <p className="text-xs md:text-sm font-medium text-[#23201D]">
                  {product.craftTechnique}
                </p>
              </div>
            </div>

            {/* Quantity Selector or Out of Stock Notice */}
            {!inStock ? (
              <div className="p-4 bg-[#F4EFE6] border border-[#E8E0D2] space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8B3A2B] font-semibold block">
                  ATELIER COMMISSION STATUS
                </span>
                <p className="text-xs text-[#7A746C] leading-relaxed">
                  This piece is currently sold out in our studio stock. Our master artisans can shape this object on a bespoke commission basis. Please enquire below with your timeline and requirements.
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-6 pt-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#7A746C]">QUANTITY</span>
                <div className="flex items-center border border-[#D1C2AC]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-xs text-[#23201D] hover:bg-[#ECE4D6]"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (quantity < maxStock) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    className={`w-8 h-8 flex items-center justify-center text-xs text-[#23201D] hover:bg-[#ECE4D6] ${
                      quantity >= maxStock ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                {typeof product.stockQuantity === 'number' && (
                  <span className="text-[10px] text-[#7A746C]">
                    Max {product.stockQuantity} available
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons: Add to Cart & Enquire Now */}
            <div className="flex flex-col space-y-3 pt-2">
              {!inStock ? (
                <button
                  disabled
                  className="w-full bg-[#5C554E]/40 text-[#FAF7F2]/70 py-4 text-[11px] font-sans tracking-[0.24em] uppercase cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.4] opacity-50" />
                  <span>OUT OF STOCK · SOLD OUT</span>
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="w-full bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] py-4 text-[11px] font-sans tracking-[0.24em] uppercase transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-[#FAF7F2]" />
                      <span>ADDED TO CART</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 stroke-[1.4]" />
                      <span>ADD TO CART · {product.price}</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => onOpenEnquiry(product)}
                className={`w-full py-3.5 text-[11px] font-sans tracking-[0.22em] uppercase transition-all duration-300 flex items-center justify-center space-x-2 ${
                  !inStock
                    ? 'bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2]'
                    : 'border border-[#23201D] text-[#23201D] hover:bg-[#23201D] hover:text-[#FAF7F2]'
                }`}
              >
                <MessageSquare className="w-4 h-4 stroke-[1.4]" />
                <span>
                  {!inStock
                    ? 'ENQUIRE TO COMMISSION THIS PIECE'
                    : 'ENQUIRE WITH ARTISAN ATELIER'}
                </span>
              </button>

              <Link
                href={`/products/${product.slug || product.id}`}
                className="w-full text-center py-2 text-[10px] font-sans tracking-[0.24em] text-[#7A746C] hover:text-[#23201D] uppercase transition-colors block"
              >
                VIEW DEDICATED ARTISAN PAGE →
              </Link>
            </div>

            {/* Recommended Pairing Card (Curated Companion Object) */}
            {topPairing && (
              <div className="pt-6 border-t border-[#E8E0D2]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#AA9B87]" />
                    RECOMMENDED PAIRING
                  </span>
                  <button
                    onClick={() => handleSelectProduct(topPairing)}
                    className="text-[10px] uppercase tracking-wider text-[#23201D] hover:text-[#AA9B87] underline underline-offset-4"
                  >
                    View Piece →
                  </button>
                </div>

                <div
                  onClick={() => handleSelectProduct(topPairing)}
                  className="group flex items-center gap-4 p-3 bg-[#F4EFE6] border border-[#E8E0D2] hover:border-[#23201D]/40 transition-colors cursor-pointer"
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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: THE MAKING (Visual Storytelling Section as Requested) */}
        {product.theMaking && (
          <div className="mt-24 pt-16 border-t border-[#E8E0D2]">
            <div className="max-w-2xl mb-12">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-2">
                PROCESS & PROVENANCE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#23201D] font-light">
                The Making
              </h2>
              <p className="text-xs md:text-sm text-[#7A746C] mt-2 font-light">
                Shaped through patience, ancestral heritage, and unhurried human touch.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Making Story Details */}
              <div className="lg:col-span-6 space-y-6">
                {product.theMaking.materialSourcing && (
                  <div className="p-6 bg-[#F4EFE6] border border-[#E8E0D2]">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] font-semibold block mb-1">
                      MATERIAL SOURCING
                    </span>
                    <p className="text-xs md:text-sm text-[#23201D] leading-relaxed">
                      {product.theMaking.materialSourcing}
                    </p>
                  </div>
                )}

                {product.theMaking.handTechnique && (
                  <div className="p-6 bg-[#F4EFE6] border border-[#E8E0D2]">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] font-semibold block mb-1">
                      HAND TECHNIQUE
                    </span>
                    <p className="text-xs md:text-sm text-[#23201D] leading-relaxed">
                      {product.theMaking.handTechnique}
                    </p>
                  </div>
                )}

                {Array.isArray(product.theMaking.careInstructions) && product.theMaking.careInstructions.length > 0 && (
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
                )}

                {product.theMaking.artisanNote && (
                  <p className="font-serif italic text-base text-[#3A3027] pl-2 border-l-2 border-[#D1C2AC]">
                    {product.theMaking.artisanNote}
                  </p>
                )}
              </div>

              {/* Right: Making Image */}
              {product.theMaking.makingImage && (
                <div className="lg:col-span-6">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECE4D6]">
                    <SafeImage
                      src={product.theMaking.makingImage}
                      alt={`Artisan crafting ${product.name}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: Recommended Handcrafted Objects */}
        {recommendedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#E8E0D2]">
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
                Complementary pieces shaped with matching noble materials, ancestral discipline, and domestic stillness.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {recommendedProducts.map((item) => {
                const itemInStock = isProductInStock(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProduct(item)}
                    className="group cursor-pointer flex flex-col bg-[#FAF7F2]"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectProduct(item);
                    }}
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
