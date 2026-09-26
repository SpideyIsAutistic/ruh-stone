'use client';

import React from 'react';
import Image from 'next/image';
import { CRAFT_OBJECTS } from '@/data/craftObjects';
import { CraftObject } from '@/types';
import ArchitecturalDivider from './ArchitecturalDivider';
import { Sparkles, Eye } from 'lucide-react';

interface JharokhaFeatureProps {
  onSelectProduct: (product: CraftObject) => void;
}

export default function JharokhaFeature({ onSelectProduct }: JharokhaFeatureProps) {
  // Spotlight the Haveli Jharokha Bas-Relief
  const masterpiece = CRAFT_OBJECTS[2]; // Haveli Jharokha Bas-Relief

  return (
    <section className="relative py-28 md:py-36 bg-[#080706] text-[#f4ecdf] overflow-hidden">
      {/* Background Architectural Jaali Motif */}
      <div className="absolute inset-0 bg-jaali opacity-25 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-[#bba172] text-[10px] tracking-[0.4em] uppercase font-sans mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#d4b584]" />
            <span>ARCHITECTURAL SPOTLIGHT</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#faf6f0] font-light tracking-[0.08em]">
            THE JHAROKHA MASTERPIECE
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-[#c2a37f] mt-3">
            "A window between stone permanence and shifting desert light."
          </p>
        </div>

        {/* Jharokha Master Frame Exhibition */}
        <div className="relative bg-[#141311] border border-[#332d26] p-8 md:p-14 lg:p-16 rounded-sm shadow-[0_28px_90px_rgba(0,0,0,0.9)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Jharokha Cusped Architectural Frame (Left) */}
            <div className="lg:col-span-6 relative flex justify-center">
              {/* Outer Jharokha Arch Cutout Frame */}
              <div className="relative w-full max-w-md aspect-[3/4] p-3 border-2 border-[#bba172]/60 rounded-t-[120px] bg-[#0c0b0a] shadow-[0_16px_50px_rgba(0,0,0,0.7)] group overflow-hidden">
                {/* Secondary Inset Arch Border */}
                <div className="relative w-full h-full rounded-t-[110px] overflow-hidden border border-[#d4b584]/30">
                  <Image
                    src={masterpiece.heroImage}
                    alt={masterpiece.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center filter brightness-95 contrast-105 transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c] via-transparent to-transparent opacity-60" />

                  {/* Top Cusped Arch Finial Silhouette */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-6 h-6 border-b border-l border-[#d4b584] rotate-45 pointer-events-none" />
                </div>

                {/* Corner Architectural Brackets */}
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#d4b584]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#d4b584]" />
              </div>
            </div>

            {/* Narrative & Acquisition Details (Right) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.35em] text-[#d4b584] font-semibold block">
                  ARCHIVAL MASTERWORK · {masterpiece.edition}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#faf6f0] tracking-[0.06em] font-light mt-2">
                  {masterpiece.name}
                </h3>
                <p className="font-serif italic text-lg text-[#c2a37f] mt-1">
                  {masterpiece.subtitle}
                </p>
              </div>

              <p className="text-sm sm:text-base font-sans text-[#c2a37f] font-light leading-relaxed">
                Carved from virgin Jaisalmer yellow fossil stone, this piece is an architectural translation of the royal jharokha balconies that cantilever over the narrow streets of the golden fortress.
              </p>

              <div className="p-6 bg-[#0c0b0a] border border-[#2c2722] space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] text-[#835c40] uppercase tracking-[0.2em] block">ORIGIN</span>
                    <span className="text-[#faf6f0] font-serif text-sm">{masterpiece.origin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#835c40] uppercase tracking-[0.2em] block">DIMENSIONS</span>
                    <span className="text-[#faf6f0] font-serif text-sm">{masterpiece.dimensions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#835c40] uppercase tracking-[0.2em] block">WEIGHT</span>
                    <span className="text-[#faf6f0] font-serif text-sm">{masterpiece.weight}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#835c40] uppercase tracking-[0.2em] block">LEAD TIME</span>
                    <span className="text-[#faf6f0] font-serif text-sm">{masterpiece.leadTime}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => onSelectProduct(masterpiece)}
                  data-cursor="pointer"
                  className="w-full sm:w-auto px-8 py-4 bg-[#d4b584] text-[#0e0d0c] hover:bg-[#faf6f0] text-xs font-sans uppercase tracking-[0.25em] font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_8px_24px_rgba(212,181,132,0.3)]"
                >
                  <Eye className="w-4 h-4" />
                  <span>VIEW FULL EXHIBITION</span>
                </button>
                <span className="font-serif text-2xl text-[#faf6f0] font-light">
                  {masterpiece.priceFormatted}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArchitecturalDivider variant="minimal" className="mt-20" />
    </section>
  );
}
