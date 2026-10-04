'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedEditorial from '@/components/FeaturedEditorial';
import EditorialTiles from '@/components/EditorialTiles';
import ShopSection from '@/components/ShopSection';
import CraftCollections from '@/components/CraftCollections';
import StorySection from '@/components/StorySection';
import LifestyleSection from '@/components/LifestyleSection';
import NewsletterBanner from '@/components/NewsletterBanner';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import ProductDetailModal from '@/components/ProductDetailModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import CartDrawer from '@/components/CartDrawer';
import ContactModal from '@/components/ContactModal';
import { CraftProduct, CartItem, CraftCategory, isProductInStock } from '@/types';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<CraftProduct | null>(null);
  const [enquiryProduct, setEnquiryProduct] = useState<CraftProduct | null>(null);
  const [products, setProducts] = useState<CraftProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CraftCategory>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingProducts(true);

    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts([]);
          }
          setIsLoadingProducts(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching storefront products from Supabase:', err);
        if (isMounted) {
          setProducts([]);
          setIsLoadingProducts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (product: CraftProduct, quantity: number = 1) => {
    if (!isProductInStock(product)) {
      return;
    }
    const maxStock = typeof product.stockQuantity === 'number' ? product.stockQuantity : 99;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const nextQty = Math.min(maxStock, updated[existingIndex].quantity + quantity);
        updated[existingIndex].quantity = nextQty;
        return updated;
      }
      return [...prev, { product, quantity: Math.min(maxStock, quantity) }];
    });

    // Gentle automated feedback: open the cart drawer after a moment
    setTimeout(() => {
      setIsCartOpen(true);
    }, 350);
  };

  const handleQuickAddToCart = (product: CraftProduct) => {
    handleAddToCart(product, 1);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].quantity = quantity;
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOpenEnquiry = (product: CraftProduct) => {
    setEnquiryProduct(product);
    setIsContactOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-[#23201D] stone-texture-subtle overflow-x-hidden selection:bg-[#D1C2AC]/50 selection:text-[#23201D]">
      {/* 1. NAVIGATION: Clean Ventura-inspired sticky navigation for Handcrafted Objects */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenContact={() => {
          setEnquiryProduct(null);
          setIsContactOpen(true);
        }}
      />

      <main>
        {/* 2. HERO SECTION: Curated handcrafted objects in warm minimalist limewash interior */}
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('featured');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. FEATURED COLLECTION: "CRAFTED WITH INTENTION" with 3-4 handcrafted objects */}
        <FeaturedEditorial
          products={products}
          onSelectProduct={setSelectedProduct}
        />

        {/* 4. TWO LARGE EDITORIAL TILES: "THE HANDCRAFTED COLLECTION" & "CRAFT & HERITAGE" */}
        <EditorialTiles
          onTile1Click={() => {
            const el = document.getElementById('shop');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onTile2Click={() => {
            const el = document.getElementById('about');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 5. PRODUCT GRID: 3-column handcrafted objects grid with realistic craft categories & INR pricing */}
        <ShopSection
          products={products}
          isLoading={isLoadingProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onSelectProduct={setSelectedProduct}
          onQuickAddToCart={handleQuickAddToCart}
          onOpenEnquiry={handleOpenEnquiry}
        />

        {/* 6. CRAFT COLLECTIONS: Categories (GERMAN SILVER, MARBLE, FIBRE) */}
        <CraftCollections products={products} onSelectCategory={setSelectedCategory} />

        {/* 7. ARTISAN STORY: "EVERY PIECE HAS A HAND BEHIND IT." with close-up artisan craftsmanship */}
        <StorySection />

        {/* 8. EDITORIAL / LIFESTYLE SECTION: "MADE TO BELONG." refined warm Indian-inspired home */}
        <LifestyleSection />

        {/* 9. FAQ SECTION: Questions about craft provenance, shipping, care, bespoke commissions & support@ruhstone.com */}
        <FAQSection onOpenContact={() => setIsContactOpen(true)} />

        {/* 10. NEWSLETTER / FINAL CTA: "BRING CRAFT HOME." with handcrafted still life */}
        <NewsletterBanner />
      </main>

      {/* 11. FOOTER: Minimal and spacious Ventura-inspired footer with exact requested links */}
      <Footer
        onOpenContact={() => {
          setEnquiryProduct(null);
          setIsContactOpen(true);
        }}
      />

      {/* PRODUCT DETAIL EXPERIENCE: Modal with large photo gallery, specs, "The Making" visual story & related objects */}
      <ErrorBoundary key={selectedProduct?.id || 'none'} resetKey={selectedProduct?.id} onReset={() => setSelectedProduct(null)}>
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenEnquiry={handleOpenEnquiry}
          onSelectRelated={(product) => setSelectedProduct(product)}
        />
      </ErrorBoundary>

      {/* Interactive Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onRestoreCart={(restored) => {
          setCartItems(restored);
          setIsCartOpen(true);
        }}
      />

      {/* Interactive Artisan Enquiry & Commission Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => {
          setIsContactOpen(false);
          setEnquiryProduct(null);
        }}
        initialProduct={enquiryProduct}
      />
    </div>
  );
}
