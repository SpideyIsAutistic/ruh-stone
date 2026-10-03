'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroProps {
  onExploreClick?: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full h-[85vh] min-h-[580px] max-h-[920px] overflow-hidden bg-[#ECE4D6]">
      {/* Background: Curated Handcrafted Objects in a Warm Minimalist Limewash Interior */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
        }`}
      >
        <Image
          src="/images/ruh-stone-banner-new.png"
          alt="Curated handcrafted silverware, brass ritual pieces, and keepsake box"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Subtle Warm Gradient Overlay for Legibility & Calm Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#23201D]/60 via-[#23201D]/20 to-black/25" />
      </div>

      {/* Minimal Overlaid Typography (Exact User Copy) */}
      <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-16 md:pb-24 text-[#FAF7F2]">
        <div
          className={`max-w-2xl transition-all duration-1000 delay-150 ease-out ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Brand Kicker */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="w-6 h-[1px] bg-[#FAF7F2]/60" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-[#FAF7F2]/90 font-medium">
              RUH STONE
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-[#FAF7F2] font-light leading-[1.08] mb-5">
            THE BEAUTY
            <br />
            OF THE HANDMADE.
          </h1>

          {/* Supporting Line */}
          <p className="text-sm md:text-base text-[#FAF7F2]/90 font-light leading-relaxed max-w-lg mb-8 tracking-wide">
            Thoughtfully crafted objects shaped by tradition, craftsmanship and human hands.
          </p>

          {/* Minimalist CTA */}
          <div>
            <a
              href="#featured"
              onClick={(e) => {
                if (onExploreClick) {
                  e.preventDefault();
                  onExploreClick();
                }
              }}
              className="inline-flex items-center space-x-3 border border-[#FAF7F2]/70 hover:border-[#FAF7F2] bg-[#FAF7F2]/10 hover:bg-[#FAF7F2] text-[#FAF7F2] hover:text-[#23201D] px-8 py-3.5 text-[11px] font-sans tracking-[0.24em] uppercase transition-all duration-300"
            >
              <span>EXPLORE COLLECTION</span>
              <span className="text-xs">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
