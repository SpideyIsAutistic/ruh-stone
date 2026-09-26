'use client';

import React, { useState } from 'react';
import SmoothScroll from '@/components/SmoothScroll';
import DustParticles from '@/components/DustParticles';
import CustomCursor from '@/components/CustomCursor';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutRuh from '@/components/AboutRuh';
import CollectionIntro from '@/components/CollectionIntro';
import JharokhaFeature from '@/components/JharokhaFeature';
import RajasthanMap from '@/components/RajasthanMap';
import CraftProcess from '@/components/CraftProcess';
import MaterialExplorer from '@/components/MaterialExplorer';
import JournalSection from '@/components/JournalSection';
import Footer from '@/components/Footer';
import ProductDetailModal from '@/components/ProductDetailModal';
import AcquisitionDrawer from '@/components/AcquisitionDrawer';
import { CraftObject, AcquisitionItem } from '@/types';
import { CRAFT_OBJECTS } from '@/data/craftObjects';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<CraftObject | null>(null);
  const [acquisitionItems, setAcquisitionItems] = useState<AcquisitionItem[]>([
    { product: CRAFT_OBJECTS[0], quantity: 1 } // Pre-load Jodhpur Monolith Urn as signature curatorial sample
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAddToCollection = (product: CraftObject) => {
    setAcquisitionItems((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Open drawer after a brief moment so user sees it in their dossier
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 350);
  };

  const handleRemoveItem = (id: string) => {
    setAcquisitionItems((prev) => prev.filter((item) => item.product.id !== id));
  };

  const handleClearItems = () => {
    setAcquisitionItems([]);
  };

  const handleSelectArtifactByName = (name: string) => {
    const found = CRAFT_OBJECTS.find(
      (obj) => obj.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(obj.name.toLowerCase())
    );
    if (found) {
      setSelectedProduct(found);
    }
  };

  const isCurrentInCollection = selectedProduct
    ? acquisitionItems.some((item) => item.product.id === selectedProduct.id)
    : false;

  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-[#080706] text-[#f4ecdf] overflow-x-hidden selection:bg-[#bd976e]/30 selection:text-[#faf6f0]">
        {/* Ambient Film Grain Overlay */}
        <div className="grain-overlay fixed inset-0 pointer-events-none z-30 opacity-70" />

        {/* Ambient Floating Stone Dust Particles */}
        <DustParticles />

        {/* Precision Architectural Custom Cursor */}
        <CustomCursor />

        {/* Fixed Minimal Architectural Navbar */}
        <Navbar
          acquisitionCount={acquisitionItems.length}
          onOpenAcquisitionDrawer={() => setIsDrawerOpen(true)}
        />

        {/* Main Content Sections */}
        <main>
          {/* Section 1: Hero Experience with Emergence */}
          <Hero />

          {/* Section 2: About RUH ("WE DON'T MAKE OBJECTS. WE PRESERVE STORIES.") */}
          <AboutRuh />

          {/* Section 3: Collection Introduction & Explorer ("OBJECTS WITH A SOUL.") */}
          <CollectionIntro onSelectProduct={setSelectedProduct} />

          {/* Section 4: Architectural Jharokha Masterpiece Feature */}
          <JharokhaFeature onSelectProduct={setSelectedProduct} />

          {/* Section 5: Hand-Drawn Antique Editorial Map of Rajasthan */}
          <RajasthanMap onSelectArtifact={handleSelectArtifactByName} />

          {/* Section 6: Full-Screen Craftsmanship Journey (6 Stages of Metamorphosis) */}
          <CraftProcess />

          {/* Section 7: Tactile Material Exploration (Stone, Silver, Artifacts) */}
          <MaterialExplorer />

          {/* Section 8: The RUH Archival Journal / Monograph Publication */}
          <JournalSection />
        </main>

        {/* Section 9: Luxury Haveli Footer */}
        <Footer />

        {/* Full-Screen Product Exhibition Modal */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCollection={handleAddToCollection}
          isAlreadyInCollection={isCurrentInCollection}
        />

        {/* Curated Collection Acquisition Drawer */}
        <AcquisitionDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          items={acquisitionItems}
          onRemoveItem={handleRemoveItem}
          onClearItems={handleClearItems}
        />
      </div>
    </SmoothScroll>
  );
}
