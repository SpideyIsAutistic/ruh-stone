'use client';

import React from 'react';
import Image from 'next/image';
import { CRAFT_OBJECTS } from '@/data/craftObjects';
import { CraftObject } from '@/types';
import ArchitecturalDivider from './ArchitecturalDivider';
import { Eye, Compass } from 'lucide-react';

interface JharokhaFeatureProps {
  onSelectProduct: (product: CraftObject) => void;
}

export default function JharokhaFeature({ onSelectProduct }: JharokhaFeatureProps) {
  const masterpiece = CRAFT_OBJECTS[2]; // Haveli Jharokha Bas-Relief

  return (
    <section className="relative py-28 md:py-36 bg-[#E7DBCA] text-[#241A14] overflow-hidden sandstone-wash">
      {/* Subtle Background Jaali Screen */}
      <div className="absolute inset-0 bg-jaali-warm opacity-25 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-[#6E3027] text-[10px] tracking-[0.4em] uppercase font-sans mb-3 font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL PROVENANCE SPOTLIGHT</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#241A14] font-light tracking-[0.06em]">
            THE JHAROKHA MONOLITH
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-[#6E3027] mt-3">
            "A window between stone permanence and shifting desert sunlight."
          </p>
        </div>

        {/* Jharokha Architectural Frame Exhibition */}
        <div className="relative bg-[#F2EBDD] border border-[#B98B62] p-8 md:p-14 lg:p-16 rounded-sm shadow-[0_20px_50px_rgba(185,139,98,0.22)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Jharokha Cusped Architectural Frame (Left) */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-[3/4] p-3 border-2 border-[#9B5540] rounded-t-[130px] bg-[#E7DBCA] shadow-[0_12px_36px_rgba(36,26,20,0.15)] group overflow-hidden">
                {/* Inset Arch Border with Cusped Profiles */}
                <div className="relative w-full h-full rounded-t-[120px] overflow-hidden border border-[#B98B62]">
                  <Image
                    src={masterpiece.heroImage}
                    alt={masterpiece.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center filter contrast-105 transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241A14]/35 via-transparent to-transparent" />

                  {/* Top Arch Finial Silhouette */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-6 h-6 border-b border-l border-[#6E3027] rotate-45 pointer-events-none" />
                </div>

                {/* Corner Architectural Brackets */}
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#6E3027]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#6E3027]" />
              </div>
            </div>

            {/* Narrative & Specifications (Right) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.35em] text-[#6E3027] font-semibold block">
                  ARCHIVAL MASTERWORK · {masterpiece.edition}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#241A14] tracking-[0.06em] font-light mt-2">
                  {masterpiece.name}
                </h3>
                <p className="font-serif italic text-lg text-[#8C613C] mt-1">
                  {masterpiece.subtitle}
                </p>
              </div>

              <p className="text-sm sm:text-base font-sans text-[#524035] font-light leading-relaxed">
                Carved from virgin Jaisalmer yellow fossil stone, this piece is an architectural translation of the royal jharokha balconies that cantilever over the desert lanes of western Rajasthan. Pierced jaali screens cast shifting lace-like geometric shadows in changing daylight.
              </p>

              <div className="p-6 bg-[#E7DBCA] border border-[#B98B62]/60 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] text-[#8C613C] uppercase tracking-[0.2em] block font-semibold">ORIGIN</span>
                    <span className="text-[#241A14] font-serif text-sm">{masterpiece.origin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C613C] uppercase tracking-[0.2em] block font-semibold">DIMENSIONS</span>
                    <span className="text-[#241A14] font-serif text-sm">{masterpiece.dimensions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C613C] uppercase tracking-[0.2em] block font-semibold">WEIGHT</span>
                    <span className="text-[#241A14] font-serif text-sm">{masterpiece.weight}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C613C] uppercase tracking-[0.2em] block font-semibold">CRAFT GUILD</span>
                    <span className="text-[#241A14] font-serif text-sm">{masterpiece.craft}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
                <button
                  onClick={() => onSelectProduct(masterpiece)}
                  data-cursor="pointer"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#241A14] hover:bg-[#6E3027] text-[#F2EBDD] text-xs font-sans uppercase tracking-[0.25em] font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_4px_16px_rgba(36,26,20,0.15)]"
                >
                  <Eye className="w-4 h-4" />
                  <span>VIEW FULL EXHIBITION</span>
                </button>
                <span className="font-serif text-2xl text-[#241A14] font-medium">
                  {masterpiece.priceFormatted}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArchitecturalDivider variant="arch" className="mt-20" />
    </section>
  );
}
