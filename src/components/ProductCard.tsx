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
      className={`group relative cursor-pointer overflow-hidden border border-[#D8C5A5] bg-[#F9F6F0] transition-all duration-500 hover:border-[#6E3027] hover:shadow-[0_16px_40px_rgba(185,139,98,0.2)] ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      {/* Corner Architectural Cinnabar Accents that illuminate on hover */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-transparent group-hover:border-[#6E3027] transition-colors duration-400 z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-transparent group-hover:border-[#6E3027] transition-colors duration-400 z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-transparent group-hover:border-[#6E3027] transition-colors duration-400 z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-transparent group-hover:border-[#6E3027] transition-colors duration-400 z-20 pointer-events-none" />

      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#E7DBCA]">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center filter contrast-105 transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle Warm Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#241A14]/30 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category & Origin Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 text-[9px] uppercase font-sans tracking-[0.25em] bg-[#F2EBDD]/90 text-[#6E3027] border border-[#D8C5A5] backdrop-blur-sm font-semibold">
            {product.category}
          </span>
          <span className="text-[10px] font-sans tracking-[0.2em] text-[#241A14] uppercase font-medium bg-[#F2EBDD]/85 px-2 py-0.5 border border-[#D8C5A5] backdrop-blur-sm">
            {product.origin.split(',')[0]}
          </span>
        </div>

        {/* Hover Plus Icon */}
        <div className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full border border-[#B98B62] bg-[#F2EBDD]/90 backdrop-blur-sm flex items-center justify-center text-[#6E3027] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-400">
          <Plus className="w-4 h-4" />
        </div>
      </div>

      {/* Editorial Metadata Block */}
      <div className="p-6 md:p-7 bg-[#F9F6F0] relative">
        <div className="flex items-center space-x-2 text-[10px] uppercase font-sans tracking-[0.25em] text-[#8C613C] mb-2 font-medium">
          <span>{product.edition}</span>
          <span>·</span>
          <span>{product.craft}</span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl text-[#241A14] tracking-[0.06em] font-light group-hover:text-[#6E3027] transition-colors duration-300">
          {product.name}
        </h3>

        <p className="font-serif italic text-xs text-[#6E3027] mt-1 line-clamp-1">
          {product.subtitle}
        </p>

        {/* Material & Price footer */}
        <div className="mt-5 pt-4 border-t border-[#D8C5A5]/70 flex items-center justify-between text-xs font-sans">
          <span className="tracking-[0.12em] text-[#524035] text-[11px] truncate max-w-[65%]">
            {product.material}
          </span>
          <span className="font-serif text-[#241A14] text-sm tracking-wider font-medium">
            {product.priceFormatted}
          </span>
        </div>
      </div>
    </article>
  );
}
