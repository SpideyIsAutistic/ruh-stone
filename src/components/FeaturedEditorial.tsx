'use client';

import React from 'react';
import Image from 'next/image';
import { CraftProduct } from '@/types';
import { CRAFT_PRODUCTS } from '@/data/craftData';

interface FeaturedEditorialProps {
  products?: CraftProduct[];
  onSelectProduct?: (product: CraftProduct) => void;
}

export default function FeaturedEditorial({
  products = CRAFT_PRODUCTS,
  onSelectProduct,
}: FeaturedEditorialProps) {
  return (
    <section id="featured" className="py-20 md:py-28 bg-[#FAF7F2] border-b border-[#E8E0D2]/70">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Large Editorial Typography & Philosophy */}
          <div className="lg:col-span-5 flex flex-col justify-between pr-0 lg:pr-8 space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-4">
                THE ATELIER PHILOSOPHY
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#23201D] font-light leading-[1.12] mb-6">
                Crafted with
                <br />
                intention.
              </h2>

              <p className="text-sm md:text-[15px] text-[#7A746C] leading-relaxed font-light mb-8 max-w-md">
                Objects made slowly, thoughtfully and by hand. Each piece carries the character of its natural material and the touch of the artisan who shaped it.
              </p>

              {/* Atelier Craftsmanship Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-[#E8E0D2]">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#23201D] font-semibold block mb-1">
                    NO SPEED MECHANIZATION
                  </span>
                  <p className="text-xs text-[#7A746C] leading-relaxed font-light">
                    Every piece is shaped by generational artisans using traditional chisels and hand tools.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#23201D] font-semibold block mb-1">
                    PURE LIVING MATERIALS
                  </span>
                  <p className="text-xs text-[#7A746C] leading-relaxed font-light">
                    German silver, Makrana marble, and natural mineral fiber with unrepeatable character.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <a
                href="#shop"
                className="inline-flex items-center space-x-2 text-[11px] font-sans tracking-[0.24em] text-[#23201D] uppercase link-underline font-medium hover:text-[#8B3A2B] transition-colors"
              >
                <span>EXPLORE ALL OBJECTS</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Right Column: Artisan Crafting Showcase Photograph */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="group relative aspect-[4/3] sm:aspect-square w-full max-w-[580px] overflow-hidden bg-[#1A1816] shadow-xl border border-[#E8E0D2]/60">
              <Image
                src="/images/atelier-carving.jpg"
                alt="Artisan hands carving intricate patterns using traditional hand chisels"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />

              {/* Gentle gradient overlay for atmospheric depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

              {/* Top Floating Badge */}
              <div className="absolute top-5 left-5 pointer-events-none">
                <span className="inline-flex items-center space-x-2 bg-black/60 backdrop-blur-md border border-white/10 text-[#FAF7F2] text-[9px] uppercase tracking-[0.25em] px-3 py-1 font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A97E] animate-pulse" />
                  <span>HEREDITARY MASTER CARVER</span>
                </span>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-6 inset-x-6 flex items-end justify-between pointer-events-none text-[#FAF7F2]">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.28em] text-[#FAF7F2]/80 font-medium block">
                    ANCESTRAL CHISELING & EMBOSSING
                  </span>
                  <p className="font-serif text-lg md:text-xl text-[#FAF7F2] font-light mt-0.5">
                    The Art of The Human Hand
                  </p>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-[#FAF7F2]/85 bg-black/50 backdrop-blur-md px-2.5 py-1 border border-white/15 uppercase hidden sm:inline-block">
                  Atelier Archive
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
