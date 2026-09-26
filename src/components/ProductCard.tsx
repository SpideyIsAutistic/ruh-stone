'use client';

import React from 'react';
import Image from 'next/image';
import { CraftObject } from '@/types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: CraftObject;
  onSelect: (product: CraftObject) => void;
  featured?: boolean;
}

export default function ProductCard({
  product,
  onSelect,
  featured = false,
}: ProductCardProps) {
  return (
    <article
      onClick={() => onSelect(product)}
      data-cursor="view-object"
      className={`group relative cursor-pointer overflow-hidden border border-[#2c2722] bg-[#141311] transition-all duration-700 hover:border-[#bba172]/80 hover:shadow-[0_24px_64px_rgba(0,0,0,0.85)] ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      {/* Corner Ornamental Brass L-Brackets that illuminate on hover */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-transparent group-hover:border-[#d4b584] transition-colors duration-500 z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-transparent group-hover:border-[#d4b584] transition-colors duration-500 z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-transparent group-hover:border-[#d4b584] transition-colors duration-500 z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-transparent group-hover:border-[#d4b584] transition-colors duration-500 z-20 pointer-events-none" />

      {/* Image Container with Slow Architectural Zoom */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0c0b0a]">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center filter brightness-85 contrast-105 transition-transform duration-1000 ease-out group-hover:scale-105 group-hover:brightness-95"
        />

        {/* Subtle Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c] via-transparent to-transparent opacity-85 group-hover:opacity-60 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0c0b0a]/30 to-[#0c0b0a]/70 pointer-events-none" />

        {/* Edition & Origin Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 text-[9px] uppercase font-sans tracking-[0.25em] bg-[#0c0b0a]/80 text-[#d4b584] border border-[#332d26] backdrop-blur-sm">
            {product.category}
          </span>
          <span className="text-[10px] font-sans tracking-[0.2em] text-[#c2a37f] uppercase font-medium bg-[#0c0b0a]/60 px-2 py-0.5 backdrop-blur-sm">
            {product.origin.split(',')[0]}
          </span>
        </div>

        {/* Hover Cue Circle Icon */}
        <div className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full border border-[#443c34] bg-[#0c0b0a]/70 backdrop-blur-sm flex items-center justify-center text-[#d4b584] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <Plus className="w-4 h-4" />
        </div>
      </div>

      {/* Editorial Metadata Block */}
      <div className="p-6 md:p-8 bg-[#141311] relative">
        <div className="flex items-center space-x-2 text-[10px] uppercase font-sans tracking-[0.3em] text-[#a17652] mb-2">
          <span>{product.edition}</span>
          <span>·</span>
          <span>{product.craft}</span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl text-[#faf6f0] tracking-[0.08em] font-light group-hover:text-[#d4b584] transition-colors duration-300">
          {product.name}
        </h3>

        <p className="font-serif italic text-xs text-[#c2a37f] mt-1.5 line-clamp-1">
          {product.subtitle}
        </p>

        {/* Materials and Specifications (reveals on hover / visible) */}
        <div className="mt-5 pt-4 border-t border-[#26221d] flex items-center justify-between text-xs font-sans text-[#a78056]">
          <span className="tracking-[0.15em] text-[#d5c0a2] text-[11px] truncate max-w-[65%]">
            {product.material}
          </span>
          <span className="font-serif text-[#faf6f0] text-sm tracking-wider font-light">
            {product.priceFormatted}
          </span>
        </div>
      </div>
    </article>
  );
}
