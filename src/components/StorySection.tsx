'use client';

import React from 'react';
import Image from 'next/image';

export default function StorySection() {
  return (
    <section id="about" className="py-24 md:py-36 bg-[#FAF7F2] border-b border-[#E8E0D2]/70">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Column: Artisan Story & Values (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-4">
                THE ARTISAN STORY
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#23201D] font-light leading-[1.12]">
                EVERY PIECE
                <br />
                HAS A HAND BEHIND IT.
              </h2>
            </div>

            <div className="space-y-6 text-sm md:text-[15px] text-[#7A746C] font-light leading-relaxed max-w-lg">
              <p className="font-medium text-[#23201D]">
                From raw material to finished object, every piece is shaped through patience, skill and human touch.
              </p>

              <p>
                RUH STONE was founded to celebrate the quiet genius of India's master craft guilds. We collaborate directly with hereditary stone carvers in Jaipur, potter families in Kutch, metalwrights in Moradabad, and wood turners in Saharanpur—interpreting ancestral techniques through a refined, contemporary minimalist lens.
              </p>

              <p>
                In a world crowded with mechanized uniformity and plastic decor, we preserve the unrepeatable character of the handmade. Every vessel, bowl, and sculptural object carries the memory of natural earth and the rhythmic intention of the human hand.
              </p>
            </div>

            {/* Core Values Matrix */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#E8E0D2]">
              <div>
                <span className="font-serif text-lg text-[#23201D] block mb-1">
                  Generational Guilds
                </span>
                <p className="text-xs text-[#7A746C] font-light">
                  Working directly with lineage artisan families without exploitative middlemen.
                </p>
              </div>

              <div>
                <span className="font-serif text-lg text-[#23201D] block mb-1">
                  Pure Earth Materials
                </span>
                <p className="text-xs text-[#7A746C] font-light">
                  Wild alluvial clay, natural desert sandstone, bell metal, and salvaged hardwood timbers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Close-Up Image of Artisan Working (NO Architecture) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] w-full overflow-hidden bg-[#ECE4D6]">
              <Image
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1600&auto=format&fit=crop"
                alt="Close-up of artisan hands carving a handcrafted object with chisel"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />

              {/* Minimal Caption */}
              <div className="absolute bottom-6 left-6 right-6 text-[#FAF7F2] text-[10px] tracking-[0.2em] uppercase font-medium bg-black/40 backdrop-blur-md px-4 py-2.5 inline-block w-fit">
                ATELIER JAIPUR · HAND-CARVING NATURAL SANDSTONE
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
