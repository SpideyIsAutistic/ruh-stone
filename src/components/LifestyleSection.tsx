'use client';

import React from 'react';
import Image from 'next/image';

export default function LifestyleSection() {
  return (
    <section className="relative w-full h-[75vh] min-h-[540px] max-h-[820px] overflow-hidden bg-[#ECE4D6]">
      {/* Large Full-Width Editorial Interior Photograph */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/lifestyle-made-to-belong.jpg"
          alt="Handcrafted marble Ganesha artwork tablet in contemporary sunlit interior"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter blur-[3px]"
        />

        {/* Soft Warm Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#23201D]/80 via-[#23201D]/25 to-transparent" />
      </div>

      {/* Editorial Text Overlay */}
      <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-16 md:pb-20 text-[#FAF7F2]">
        <div className="max-w-xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#FAF7F2]/80 font-medium block mb-3">
            LIVING WITH CRAFT
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAF7F2] font-light leading-tight mb-4">
            MADE TO BELONG.
          </h2>

          <p className="text-sm md:text-base text-[#FAF7F2]/85 font-light leading-relaxed tracking-wide">
            Handcrafted objects designed to live naturally within contemporary spaces.
          </p>
        </div>
      </div>
    </section>
  );
}
