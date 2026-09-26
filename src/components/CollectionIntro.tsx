'use client';

import React, { useState } from 'react';
import { CRAFT_OBJECTS } from '@/data/craftObjects';
import { CraftObject, ProductCategory } from '@/types';
import ProductCard from './ProductCard';
import ArchitecturalDivider from './ArchitecturalDivider';

interface CollectionIntroProps {
  onSelectProduct: (product: CraftObject) => void;
}

export default function CollectionIntro({ onSelectProduct }: CollectionIntroProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: { label: string; value: string; desc: string }[] = [
    {
      label: 'ALL OBJECTS',
      value: 'ALL',
      desc: 'The complete archive of hand-hewn stone, chased German silver, and conserved heritage artifacts.',
    },
    {
      label: 'STONE',
      value: 'STONE',
      desc: 'Monolithic desert rose sandstone, imperial Makrana marble, and Jurassic fossil limestone vessels.',
    },
    {
      label: 'GERMAN SILVER',
      value: 'GERMAN SILVER',
      desc: 'Hand-hammered repoussé urns, chased architectural mirrors, and royal court metallurgy.',
    },
    {
      label: 'ARTIFACTS',
      value: 'ARTIFACTS',
      desc: 'Conserved architectural haveli capitals, reclaimed Shekhawati teak brackets, and temple fragments.',
    },
    {
      label: "COLLECTOR'S EDITIONS",
      value: "COLLECTOR'S EDITIONS",
      desc: 'Strictly numbered masterworks, archival monoliths, and museum-grade collaborative commissions.',
    },
  ];

  const filteredObjects =
    selectedCategory === 'ALL'
      ? CRAFT_OBJECTS
      : CRAFT_OBJECTS.filter((obj) => obj.category === (selectedCategory as ProductCategory));

  const currentDesc = categories.find((c) => c.value === selectedCategory)?.desc;

  return (
    <section id="collection" className="relative py-28 md:py-36 bg-[#0c0b0a] text-[#f4ecdf] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header per Prompt Section 9 */}
        <div className="max-w-4xl mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-[#bba172]" />
            <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#bba172] font-semibold">
              THE PERMANENT ARCHIVE
            </span>
          </div>

          <h2 className="font-serif text-5xl sm:text-7xl md:text-8xl tracking-[0.06em] text-[#faf6f0] font-light leading-[1.05]">
            OBJECTS <br />
            <span className="italic text-[#d4b584]">WITH A SOUL.</span>
          </h2>

          <p className="font-serif italic text-xl sm:text-2xl text-[#c2a37f] mt-6">
            "Stone, silver and artifacts shaped by hand, time and place."
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center gap-3 pb-8 border-b border-[#2c2722]">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              data-cursor="pointer"
              className={`px-5 py-2.5 text-xs font-sans tracking-[0.25em] uppercase transition-all duration-300 ${
                selectedCategory === cat.value
                  ? 'border border-[#d4b584] bg-[#221c17] text-[#faf6f0] shadow-[0_0_12px_rgba(212,181,132,0.2)]'
                  : 'border border-[#2c2722] bg-[#141311]/80 text-[#a78056] hover:border-[#443c34] hover:text-[#d5c0a2]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Category Narrative Statement */}
        {currentDesc && (
          <div className="pt-6 pb-12 flex items-center justify-between text-xs font-sans tracking-[0.18em] text-[#a17652] uppercase">
            <span>{currentDesc}</span>
            <span className="text-[#d4b584] hidden md:inline-block">
              {filteredObjects.length} ARCHIVAL WORKS SHOWN
            </span>
          </div>
        )}

        {/* Large Editorial Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredObjects.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              featured={idx === 0 && selectedCategory === 'ALL'}
            />
          ))}
        </div>
      </div>

      <ArchitecturalDivider variant="jaali" className="mt-20" />
    </section>
  );
}
