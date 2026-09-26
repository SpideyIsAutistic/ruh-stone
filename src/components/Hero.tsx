'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowDown, Compass } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex items-center bg-[#F2EBDD] text-[#241A14] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 plaster-texture">
      {/* Subtle Architectural Jaali Lattice Background Overlay */}
      <div className="absolute inset-0 bg-jaali-subtle opacity-35 pointer-events-none" />

      {/* Warm Golden Hour Light Gradient Overlay */}
      <div className="absolute top-0 right-0 w-[55vw] h-[55vw] bg-radial from-[#D8C5A5]/40 via-[#B98B62]/10 to-transparent pointer-events-none rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Architectural Plaque & Refined Brand Narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-8 z-10">
            {/* Atelier Geographical Registry */}
            <div className="inline-flex items-center space-x-3 text-[10px] font-sans uppercase tracking-[0.3em] text-[#6E3027] font-semibold border-b border-[#D8C5A5] pb-3 max-w-fit">
              <span className="w-2 h-2 rotate-45 bg-[#6E3027]" />
              <span>MARWAR & MEWAR · 26.9124° N, 75.7873° E</span>
            </div>

            {/* Refined Brand Mark */}
            <div className="space-y-3">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-[0.14em] text-[#241A14] font-light leading-[1.05]">
                RUH STONE
              </h1>
              <p className="font-serif italic text-2xl sm:text-3xl text-[#6E3027] tracking-wide">
                Soul in Stone.
              </p>
            </div>

            {/* Core Manifesto Statement per user specification */}
            <div className="space-y-4 max-w-lg">
              <p className="font-serif text-2xl sm:text-3xl text-[#382A22] font-light leading-snug">
                Objects shaped by earth, <br />
                <span className="italic text-[#9B5540]">hand and time.</span>
              </p>
              <p className="text-sm font-sans text-[#524035] font-light leading-relaxed">
                A contemporary Rajasthan haveli transformed into an architectural craft house. We hand-carve monumental desert sandstone, chase traditional German silver, and conserve centuries-old architectural heirlooms.
              </p>
            </div>

            {/* Editorial Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-5">
              <a
                href="#collection"
                data-cursor="pointer"
                className="px-7 py-3.5 bg-[#241A14] hover:bg-[#6E3027] text-[#F2EBDD] text-xs font-sans uppercase tracking-[0.25em] font-medium transition-all duration-300 shadow-[0_4px_16px_rgba(36,26,20,0.15)]"
              >
                ENTER THE SANCTUARY
              </a>
              <a
                href="#story"
                data-cursor="pointer"
                className="px-6 py-3.5 border border-[#B98B62] text-[#241A14] hover:bg-[#D8C5A5]/30 text-xs font-sans uppercase tracking-[0.25em] font-medium transition-all duration-300"
              >
                OUR HERITAGE
              </a>
            </div>

            {/* Material Chips */}
            <div className="pt-6 border-t border-[#D8C5A5] flex flex-wrap gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-[#8C613C]">
              <span className="px-3 py-1 bg-[#E7DBCA]/70 border border-[#D8C5A5]">JODHPUR ROSE SANDSTONE</span>
              <span className="px-3 py-1 bg-[#E7DBCA]/70 border border-[#D8C5A5]">MAKRANA CALCITE MARBLE</span>
              <span className="px-3 py-1 bg-[#E7DBCA]/70 border border-[#D8C5A5]">CHASED GERMAN SILVER</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Large Vertical Architectural Photograph */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[3/4] max-w-lg mx-auto w-full overflow-hidden border border-[#B98B62]/60 p-3 bg-[#E7DBCA] shadow-[0_20px_50px_rgba(185,139,98,0.22)]">
              {/* Corner Cinnabar Architectural Brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#6E3027] z-20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#6E3027] z-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#6E3027] z-20 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#6E3027] z-20 pointer-events-none" />

              {/* Haveli Architecture Imagery */}
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop"
                  alt="Historic Rajasthan haveli courtyard with carved sandstone pillars at golden hour"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center filter contrast-105 brightness-98 transition-transform duration-1000 ease-out hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241A14]/35 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Architectural Inset Plaque */}
              <div className="absolute bottom-6 left-6 right-6 z-10 p-3.5 bg-[#F2EBDD]/95 border border-[#B98B62] backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-sans tracking-[0.25em] text-[#6E3027] uppercase block font-semibold">
                    COURTYARD ARCHIVE · JAIPUR
                  </span>
                  <p className="font-serif italic text-xs text-[#241A14] mt-0.5">
                    "Morning sunlight filtering through hand-chiseled sandstone arches."
                  </p>
                </div>
                <Compass className="w-4 h-4 text-[#9B5540] flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Minimalist Scroll Invitation */}
        <div className="mt-16 pt-8 border-t border-[#D8C5A5] flex items-center justify-between text-xs font-sans text-[#8C613C] tracking-[0.25em] uppercase">
          <div className="flex items-center space-x-3">
            <span className="h-[1px] w-12 bg-[#B98B62]" />
            <span>VOLUME I · AUTUMN EXHIBITION</span>
          </div>

          <a
            href="#collection"
            data-cursor="pointer"
            className="flex items-center space-x-2 text-[#241A14] hover:text-[#6E3027] transition-colors"
          >
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
