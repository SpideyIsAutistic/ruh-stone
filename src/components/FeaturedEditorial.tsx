'use client';

import React from 'react';
import Image from 'next/image';
import { CraftProduct } from '@/types';

interface FeaturedEditorialProps {
  products?: CraftProduct[];
  onSelectProduct?: (product: CraftProduct) => void;
}

export default function FeaturedEditorial({
  products = [],
  onSelectProduct,
}: FeaturedEditorialProps) {
  const handleScrollToShop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('shop');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = 'shop';
    }
  };

  return (
    <section id="featured" className="py-24 md:py-32 lg:py-36 bg-[#FAF7F2] border-b border-[#E8E0D2]/70">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left Column: Atelier Philosophy Editorial Narrative (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Eyebrow */}
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-3 sm:mb-4">
              THE ATELIER PHILOSOPHY
            </span>

            {/* Main Heading */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[52px] text-[#23201D] font-light leading-[1.14] mb-5 tracking-normal">
              Crafted with intention.
            </h2>

            {/* Intro Paragraph */}
            <p className="text-sm sm:text-[15px] md:text-base text-[#5C554E] leading-[1.75] font-light max-w-xl mb-7 sm:mb-8">
              Objects made slowly, thoughtfully and by hand. Each piece carries the character of its natural material and the touch of the artisan who shaped it.
            </p>

            {/* Subtle Horizontal Divider */}
            <div className="w-full h-px bg-[#E8E0D2] mb-7 sm:mb-8" />

            {/* Two Refined Editorial Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-9">
              <div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#23201D] font-medium block mb-2">
                  01 — THE CRAFT
                </span>
                <p className="text-xs sm:text-[13px] text-[#7A746C] font-light leading-relaxed">
                  Shaped with patience, precision and traditional techniques passed through generations.
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#23201D] font-medium block mb-2">
                  02 — THE MATERIAL
                </span>
                <p className="text-xs sm:text-[13px] text-[#7A746C] font-light leading-relaxed">
                  German silver, natural wood and carefully selected materials chosen for their distinctive character.
                </p>
              </div>
            </div>

            {/* Small Elegant CTA */}
            <div>
              <a
                href="#shop"
                onClick={handleScrollToShop}
                className="inline-flex items-center space-x-2 text-[11px] font-sans tracking-[0.24em] text-[#23201D] uppercase font-medium hover:text-[#7A746C] transition-colors group"
              >
                <span>EXPLORE ALL OBJECTS</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1.5 font-sans">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Artisan Craftsmanship Visual Anchor (6 Cols) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px] lg:max-w-[580px] xl:max-w-[620px]">
              <div className="relative aspect-square w-full overflow-hidden bg-[#1A1816] shadow-[0_16px_40px_rgba(35,32,29,0.07)] border border-[#E8E0D2]">
                <Image
                  src="/images/atelier-carving.jpg"
                  alt="Artisan hands carving intricate patterns into natural material using traditional chisels"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 620px"
                  className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.015]"
                />
              </div>

              {/* Understated Editorial Caption */}
              <div className="mt-3 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-[#7A746C]">
                <span>JAIPUR ATELIER</span>
                <span>HAND-CHISELLED RELIEF CARVING</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
