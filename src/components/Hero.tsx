'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  const [loadStage, setLoadStage] = useState(0);

  useEffect(() => {
    // Cinematic 7-stage emergence sequence per prompt specifications
    const timers = [
      setTimeout(() => setLoadStage(1), 150),  // Texture emerges
      setTimeout(() => setLoadStage(2), 600),  // Fine ornamental border reveals
      setTimeout(() => setLoadStage(3), 1100), // RUH STONE emerges
      setTimeout(() => setLoadStage(4), 1700), // Tagline "Soul in Stone."
      setTimeout(() => setLoadStage(5), 2300), // Architectural subtitle & scroll cue
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080706]">
      {/* Background Architectural Editorial Visual with Vignette */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1500 ${
          loadStage >= 1 ? 'opacity-40' : 'opacity-0'
        }`}
      >
        <Image
          src="https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2000&auto=format&fit=crop"
          alt="Historic Rajasthan haveli courtyard bathed in golden hour light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transform transition-transform duration-[10000ms] ease-out hover:scale-100 filter brightness-60 contrast-110"
        />
        {/* Radial Dark Vignette & Earthen Gradients */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0c0b0a]/75 to-[#080706]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-[#080706]/80" />
        <div className="absolute inset-0 sandstone-texture opacity-25" />
      </div>

      {/* Hero Content Framing & Fine Ornamental Border */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-16 flex flex-col items-center">
        {/* Fine Rajasthani Architectural Ornamental Crest */}
        <div
          className={`transition-all duration-1200 ease-out mb-6 flex items-center space-x-4 ${
            loadStage >= 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-[#bba172]" />
          <div className="flex items-center space-x-1.5 text-[#d4b584]">
            <span className="w-1.5 h-1.5 rotate-45 border border-[#bba172]" />
            <span className="text-[10px] uppercase font-sans tracking-[0.45em] text-[#d4b584] font-medium">
              CONTEMPORARY RAJASTHAN
            </span>
            <span className="w-1.5 h-1.5 rotate-45 border border-[#bba172]" />
          </div>
          <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-[#bba172]" />
        </div>

        {/* Framing Box with Fine Carved Border */}
        <div
          className={`relative p-8 md:p-14 transition-all duration-1200 ease-out ${
            loadStage >= 2
              ? 'border border-[#443c34]/60 bg-[#0e0d0c]/50 backdrop-blur-[2px]'
              : 'border-transparent'
          }`}
        >
          {/* Corner Ornamental Flourishes */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#bba172]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#bba172]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#bba172]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#bba172]" />

          {/* Brand Heading: RUH STONE */}
          <h1
            className={`font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.22em] text-[#faf6f0] font-light transition-all duration-1500 ease-out select-none ${
              loadStage >= 3
                ? 'opacity-100 translate-y-0 filter blur-none'
                : 'opacity-0 translate-y-8 filter blur-sm'
            }`}
          >
            RUH STONE
          </h1>

          {/* Tagline: Soul in Stone. */}
          <p
            className={`font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#d4b584] mt-4 tracking-wider transition-all duration-1200 delay-200 ease-out ${
              loadStage >= 4
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            Soul in Stone.
          </p>

          {/* Heritage Monograph Statement */}
          <div
            className={`mt-8 max-w-xl mx-auto transition-all duration-1000 delay-300 ease-out ${
              loadStage >= 5
                ? 'opacity-90 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <p className="text-xs sm:text-sm font-sans tracking-[0.2em] uppercase text-[#c2a37f] font-light leading-relaxed">
              Handcrafted stone objects, German silver pieces, and curated Indian artifacts shaped by master-masons of Rajasthan.
            </p>
          </div>
        </div>

        {/* Quick Attribute Tags */}
        <div
          className={`mt-10 flex flex-wrap justify-center gap-6 text-[10px] font-sans tracking-[0.3em] uppercase text-[#a17652] transition-opacity duration-1000 ${
            loadStage >= 5 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>MONUMENTAL STONE</span>
          <span>·</span>
          <span>CHASED GERMAN SILVER</span>
          <span>·</span>
          <span>ARCHIVAL ARTIFACTS</span>
        </div>

        {/* Scroll Indicator */}
        <a
          href="#collection"
          aria-label="Scroll to discover collection"
          className={`mt-14 inline-flex flex-col items-center space-y-3 group cursor-pointer transition-all duration-1000 ${
            loadStage >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          data-cursor="pointer"
        >
          <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#d4b584]/80 group-hover:text-[#faf6f0] transition-colors">
            ENTER THE SANCTUARY
          </span>
          <div className="w-5 h-9 rounded-full border border-[#443c34] flex items-center justify-center p-1 group-hover:border-[#bba172] transition-colors">
            <ArrowDown className="w-3.5 h-3.5 text-[#bba172] animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  );
}
