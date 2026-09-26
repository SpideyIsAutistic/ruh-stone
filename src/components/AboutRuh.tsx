import React from 'react';
import Image from 'next/image';
import ArchitecturalDivider from './ArchitecturalDivider';

export default function AboutRuh() {
  return (
    <section id="story" className="relative py-28 md:py-36 bg-[#0c0b0a] text-[#f4ecdf] overflow-hidden">
      {/* Background Architectural Jaali Watermark */}
      <div className="absolute inset-0 bg-jaali opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8f4832]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header Tag */}
        <div className="flex items-center space-x-3 mb-10">
          <span className="w-8 h-[1px] bg-[#bba172]" />
          <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#bba172] font-semibold">
            THE ATELIER PHILOSOPHY
          </span>
        </div>

        {/* Huge Typographic Manifesto */}
        <div className="mb-20">
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.06em] leading-[1.08] text-[#faf6f0] font-light max-w-5xl">
            WE DON'T <br />
            <span className="text-[#a78056] italic">MAKE OBJECTS.</span> <br />
            WE PRESERVE <br />
            <span className="text-[#d4b584]">STORIES.</span>
          </h2>
        </div>

        {/* Editorial Split Grid: Narrative & Artisan Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Narrative Column */}
          <div className="lg:col-span-6 flex flex-col space-y-8">
            <p className="font-serif text-2xl md:text-3xl text-[#e7dac5] font-light leading-relaxed">
              RUH STONE exists to bring traditional Indian craftsmanship into contemporary architectural sanctuaries.
            </p>

            <div className="space-y-6 text-sm md:text-base font-sans text-[#c2a37f] font-light leading-relaxed">
              <p>
                In a world crowded with ephemeral plastics and mass-manufactured replicas, stone possesses an uncompromising physical truth. It has endured two hundred million years beneath the desert sun; it cannot be hurried by algorithms or expedited by modern commerce.
              </p>
              <p>
                We collaborate exclusively with hereditary master-masons—the <em>Silawats</em> of Marwar, the <em>Sompuras</em> of western Gujarat and Rajasthan, and the <em>Kaseras</em> of Udaipur. These artisans do not refer to mechanical blueprints; their measurements are rooted in the ancient Sanskrit canons of the <em>Shilpa Shastras</em>, where every curve carries cosmological equilibrium.
              </p>
              <p className="italic font-serif text-lg text-[#d4b584]">
                "Every strike of the chisel leaves an unrepeatable signature. The stone absorbs the breath and patience of the maker until it acquires a soul—its Ruh."
              </p>
            </div>

            {/* Atelier Metrics */}
            <div className="pt-8 border-t border-[#2c2722] grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <span className="font-serif text-3xl md:text-4xl text-[#faf6f0] font-light">18+</span>
                <p className="text-[10px] tracking-[0.22em] text-[#a17652] uppercase mt-1">
                  Generations of Hereditary Guild Lineage
                </p>
              </div>
              <div>
                <span className="font-serif text-3xl md:text-4xl text-[#faf6f0] font-light">100%</span>
                <p className="text-[10px] tracking-[0.22em] text-[#a17652] uppercase mt-1">
                  Hand-Hewn & River Silt Burnished
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="font-serif text-3xl md:text-4xl text-[#faf6f0] font-light">0%</span>
                <p className="text-[10px] tracking-[0.22em] text-[#a17652] uppercase mt-1">
                  Chemical Sealants or Synthetic Resins
                </p>
              </div>
            </div>
          </div>

          {/* Artisan Photography Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#443c34]/70 p-3 bg-[#141311]">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop"
                  alt="Senior Rajasthani master stonecutter Mohanlal Silawat chiseling raw pink sandstone"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center filter brightness-90 contrast-105 transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-transparent opacity-60" />
              </div>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#bba172]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#bba172]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#bba172]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#bba172]" />
            </div>

            {/* Captioned Plinth */}
            <div className="mt-4 flex items-center justify-between text-[11px] font-sans text-[#a17652] tracking-[0.2em] uppercase">
              <span>FIG. 01 — THE HAND OF THE SILAWAT</span>
              <span>MARWAR ATELIER, JODHPUR</span>
            </div>
          </div>
        </div>
      </div>

      <ArchitecturalDivider variant="jaali" className="mt-20" />
    </section>
  );
}
