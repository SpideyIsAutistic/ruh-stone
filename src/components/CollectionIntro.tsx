'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CRAFT_OBJECTS } from '@/data/craftObjects';
import { CraftObject, ProductCategory } from '@/types';
import ProductCard from './ProductCard';
import ArchitecturalDivider from './ArchitecturalDivider';

interface CollectionIntroProps {
  onSelectProduct: (product: CraftObject) => void;
}

export default function CollectionIntro({ onSelectProduct }: CollectionIntroProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const haveliRooms = [
    {
      category: 'STONE',
      title: 'STONE',
      subtitle: 'FORMED FROM EARTH.',
      tagline: 'Hand-carved stone objects shaped in Rajasthan.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop',
    },
    {
      category: 'GERMAN SILVER',
      title: 'GERMAN SILVER',
      subtitle: 'MADE TO CATCH THE LIGHT.',
      tagline: 'Chased and hammered royal court metallurgy.',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
    },
    {
      category: 'ARTIFACTS',
      title: 'ARTIFACTS',
      subtitle: 'OBJECTS WITH A PAST.',
      tagline: 'Conserved 18th & 19th-century haveli heirlooms.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
    },
    {
      category: "COLLECTOR'S EDITIONS",
      title: "COLLECTOR'S EDITION",
      subtitle: 'THE ARCHIVAL MONOLITHS.',
      tagline: 'Strictly numbered contemporary sanctuary masterworks.',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const filteredObjects =
    selectedCategory === 'ALL'
      ? CRAFT_OBJECTS
      : CRAFT_OBJECTS.filter((obj) => obj.category === (selectedCategory as ProductCategory));

  return (
    <section id="collection" className="relative py-28 md:py-36 bg-[#F2EBDD] text-[#241A14] overflow-hidden plaster-texture">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-4xl mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-[#6E3027]" />
            <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#6E3027] font-semibold">
              THE PERMANENT ARCHIVE
            </span>
          </div>

          <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-[0.06em] text-[#241A14] font-light leading-[1.05]">
            OBJECTS <br />
            <span className="italic text-[#9B5540]">WITH A SOUL.</span>
          </h2>

          <p className="font-serif italic text-xl sm:text-2xl text-[#6E3027] mt-4">
            "Stone, silver and artifacts shaped by hand, time and place."
          </p>
        </div>

        {/* Haveli Rooms Portals per prompt section 8 */}
        <div className="mb-20">
          <div className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#8C613C] mb-4 font-semibold">
            ENTER THE HAVELI GALLERIES
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {haveliRooms.map((room) => {
              const isSelected = selectedCategory === room.category;
              return (
                <div
                  key={room.category}
                  onClick={() => setSelectedCategory(room.category)}
                  data-cursor="pointer"
                  className={`group relative cursor-pointer overflow-hidden border p-5 transition-all duration-400 ${
                    isSelected
                      ? 'border-[#6E3027] bg-[#E7DBCA] shadow-[0_12px_28px_rgba(110,48,39,0.15)]'
                      : 'border-[#D8C5A5] bg-[#F9F6F0] hover:border-[#B98B62]'
                  }`}
                >
                  {/* Category Image Thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#D8C5A5] mb-4 bg-[#D8C5A5]">
                    <Image
                      src={room.image}
                      alt={room.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover object-center filter contrast-105 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241A14]/40 via-transparent to-transparent" />
                  </div>

                  <span className="text-[9px] uppercase font-sans tracking-[0.25em] text-[#8C613C] font-semibold block">
                    {room.title}
                  </span>
                  <h3 className="font-serif text-lg text-[#241A14] mt-1 font-light group-hover:text-[#6E3027] transition-colors">
                    {room.subtitle}
                  </h3>
                  <p className="text-xs font-sans text-[#524035] font-light mt-1.5 leading-relaxed line-clamp-2">
                    {room.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Navigation Pills */}
        <div className="flex flex-wrap items-center gap-3 pb-8 border-b border-[#D8C5A5]">
          {['ALL', 'STONE', 'GERMAN SILVER', 'ARTIFACTS', "COLLECTOR'S EDITIONS"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-cursor="pointer"
              className={`px-5 py-2 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 ${
                selectedCategory === cat
                  ? 'border border-[#6E3027] bg-[#6E3027] text-[#F2EBDD]'
                  : 'border border-[#D8C5A5] bg-[#F9F6F0] text-[#524035] hover:border-[#B98B62] hover:text-[#241A14]'
              }`}
            >
              {cat === 'ALL' ? 'ALL OBJECTS' : cat}
            </button>
          ))}
        </div>

        <div className="py-6 flex items-center justify-between text-xs font-sans text-[#8C613C] tracking-[0.2em] uppercase">
          <span>SHOWING {filteredObjects.length} HANDCRAFTED PIECES</span>
          <span className="hidden md:inline-block">AUTHENTIC PROVENANCE DOSSIER INCLUDED</span>
        </div>

        {/* Editorial Product Grid */}
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
