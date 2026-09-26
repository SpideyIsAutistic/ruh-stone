import React from 'react';
import Image from 'next/image';
import ArchitecturalDivider from './ArchitecturalDivider';

export default function AboutRuh() {
  return (
    <section id="story" className="relative py-28 md:py-36 bg-[#D8C5A5] text-[#241A14] overflow-hidden sandstone-wash">
      {/* Background Architectural Jaali Pattern */}
      <div className="absolute inset-0 bg-jaali-warm opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header Tag */}
        <div className="flex items-center space-x-3 mb-10">
          <span className="w-8 h-[1px] bg-[#6E3027]" />
          <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#6E3027] font-semibold">
            THE ATELIER MANIFESTO
          </span>
        </div>

        {/* Large Typographic Statement per user prompt */}
        <div className="mb-16 md:mb-20">
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.06em] leading-[1.08] text-[#241A14] font-light max-w-5xl">
            WE DON'T MAKE <br />
            <span className="text-[#8C613C] italic">OBJECTS.</span> <br />
            WE PRESERVE <br />
            <span className="text-[#6E3027]">STORIES.</span>
          </h2>
        </div>

        {/* Editorial Split Grid: Narrative & Artisan Workshop Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Narrative Column */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <p className="font-serif text-2xl sm:text-3xl text-[#382A22] font-light leading-relaxed">
              RUH STONE brings traditional Indian craftsmanship into contemporary spaces.
            </p>

            <p className="font-serif italic text-lg sm:text-xl text-[#6E3027]">
              "Every object carries the material, marks and memory of the hands that shaped it."
            </p>

            <div className="space-y-4 text-sm font-sans text-[#524035] font-light leading-relaxed">
              <p>
                In Rajasthan, stone is not an inert raw supply; it is a sacred geological archive. The sedimentary rose sandstone of Marwar and the crystalline white marble of Makrana have weathered desert sun and monsoon rains for hundreds of millions of years.
              </p>
              <p>
                We partner directly with the hereditary artisan guilds—the <em>Silawats</em> who hewed the ramparts of Mehrangarh, the <em>Sompuras</em> who hold oral mathematical verses of the <em>Shilpa Shastras</em>, and the <em>Kaseras</em> of Udaipur who hammer royal silver into moonlit ceremonial forms.
              </p>
              <p>
                Each creation rejects the hurried coldness of digital machinery. When an artisan strikes a chisel against rock, the stone absorbs human intention, patience, and breath—becoming an enduring anchor for contemporary sanctuaries.
              </p>
            </div>

            {/* Atelier Disciplines Grid */}
            <div className="pt-6 border-t border-[#B98B62]/60 grid grid-cols-3 gap-6">
              <div>
                <span className="font-serif text-3xl md:text-4xl text-[#241A14] font-light">18+</span>
                <p className="text-[10px] tracking-[0.2em] text-[#6E3027] uppercase mt-1 font-semibold">
                  Generations of Guild Lineage
                </p>
              </div>
              <div>
                <span className="font-serif text-3xl md:text-4xl text-[#241A14] font-light">100%</span>
                <p className="text-[10px] tracking-[0.2em] text-[#6E3027] uppercase mt-1 font-semibold">
                  Hand-Hewn & Silt Buffed
                </p>
              </div>
              <div>
                <span className="font-serif text-3xl md:text-4xl text-[#241A14] font-light">0%</span>
                <p className="text-[10px] tracking-[0.2em] text-[#6E3027] uppercase mt-1 font-semibold">
                  Chemical Sealants
                </p>
              </div>
            </div>
          </div>

          {/* Artisan Workshop Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#9B5540]/60 p-3 bg-[#F2EBDD] shadow-[0_16px_40px_rgba(36,26,20,0.12)]">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop"
                  alt="Senior master carver Mohanlal Silawat chiseling raw pink sandstone in an open haveli courtyard"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center filter contrast-105 transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241A14]/30 via-transparent to-transparent" />
              </div>

              {/* Hand-carved Cinnabar Corner Flourishes */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#6E3027]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#6E3027]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#6E3027]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#6E3027]" />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-sans text-[#6E3027] tracking-[0.2em] uppercase font-medium">
              <span>PLATE 01 — THE HAND OF THE SILAWAT</span>
              <span>MARWAR ATELIER, JODHPUR</span>
            </div>
          </div>
        </div>
      </div>

      <ArchitecturalDivider variant="jaali" className="mt-20" />
    </section>
  );
}
