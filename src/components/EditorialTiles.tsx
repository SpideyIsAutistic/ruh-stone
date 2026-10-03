'use client';

import React from 'react';
import Image from 'next/image';

interface EditorialTilesProps {
  onTile1Click?: () => void;
  onTile2Click?: () => void;
}

export default function EditorialTiles({ onTile1Click, onTile2Click }: EditorialTilesProps) {
  return (
    <section id="editorial-tiles" className="py-16 md:py-24 bg-[#FAF7F2]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* TILE 1: THE HANDCRAFTED COLLECTION (Product & Lifestyle Focused) */}
          <a
            href="#shop"
            onClick={(e) => {
              if (onTile1Click) {
                e.preventDefault();
                onTile1Click();
              }
            }}
            className="group relative block aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5] lg:aspect-[1/1] overflow-hidden bg-[#ECE4D6]"
            aria-label="Explore The Handcrafted Collection"
          >
            {/* Background: Beautifully styled collection of handcrafted decor objects */}
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.02]">
              <Image
                src="/images/editorial-handcrafted-collection.jpg"
                alt="The Handcrafted Collection - Handcrafted marble artwork and heritage brass vessels"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
              {/* Subtle darkened vignette for typography legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/25 group-hover:from-black/75 transition-colors duration-500" />
            </div>

            {/* Overlaid Editorial Text */}
            <div className="relative h-full flex flex-col justify-between p-8 md:p-12 text-[#FAF7F2]">
              {/* Top Label */}
              <div className="transition-transform duration-500 ease-out group-hover:translate-x-1">
                <span className="text-[11px] uppercase tracking-[0.28em] font-medium text-[#FAF7F2]/85">
                  EXPLORE
                </span>
              </div>

              {/* Bottom Title */}
              <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FAF7F2] font-light tracking-wide mb-2">
                  THE HANDCRAFTED COLLECTION
                </h3>
                <p className="text-xs tracking-wider text-[#FAF7F2]/80 uppercase">
                  OBJECTS MADE WITH INTENTION
                </p>
              </div>
            </div>
          </a>

          {/* TILE 2: CRAFT & HERITAGE (Artisan Craftsmanship Focused) */}
          <a
            href="#about"
            onClick={(e) => {
              if (onTile2Click) {
                e.preventDefault();
                onTile2Click();
              }
            }}
            className="group relative block aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5] lg:aspect-[1/1] overflow-hidden bg-[#ECE4D6]"
            aria-label="Discover Craft & Heritage"
          >
            {/* Background: Hand-embellished royal marble elephants */}
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.02]">
              <Image
                src="/images/editorial-craft-heritage.jpg"
                alt="Craft & Heritage - Handcrafted embellished marble elephants in sunlit heritage courtyard"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
              {/* Subtle darkened vignette for typography legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/25 group-hover:from-black/75 transition-colors duration-500" />
            </div>

            {/* Overlaid Editorial Text */}
            <div className="relative h-full flex flex-col justify-between p-8 md:p-12 text-[#FAF7F2]">
              {/* Top Label */}
              <div className="transition-transform duration-500 ease-out group-hover:translate-x-1">
                <span className="text-[11px] uppercase tracking-[0.28em] font-medium text-[#FAF7F2]/85">
                  THE ARTISAN'S HAND
                </span>
              </div>

              {/* Bottom Title */}
              <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FAF7F2] font-light tracking-wide mb-2">
                  CRAFT & HERITAGE
                </h3>
                <p className="text-xs tracking-wider text-[#FAF7F2]/80 uppercase">
                  TRADITION, REIMAGINED FOR TODAY
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
