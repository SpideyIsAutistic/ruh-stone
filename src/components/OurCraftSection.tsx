'use client';

import React from 'react';
import Image from 'next/image';

export default function OurCraftSection() {
  const craftDisciplines = [
    {
      title: 'STONE CARVING',
      region: 'Jaipur & Udaipur, Rajasthan',
      materials: 'Desert Sandstone & Calcitic Marble',
      description:
        'Honed from single monolithic boulders using tempered carbon-steel chisels. Our master carvers follow century-old Silawat guild methods, burnishing surfaces with local river silt to preserve the stone’s velvety, breathable touch.',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'CLAY & TERRACOTTA',
      region: 'Kutch & Alwar, Gujarat & Rajasthan',
      materials: 'Alluvial River Clay & Wood Ash',
      description:
        'Thrown on traditional stone fly-wheels or coiled by hand and compacted with wooden paddles and stone anvils. Fired in open-pit wood kilns where licking flames impart subtle earthen smoke blushing.',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'BELL METAL & BRASS',
      region: 'Moradabad & Bastar',
      materials: '78:22 Kansa Bronze & Sheet Brass',
      description:
        'Forged hot over open charcoal hearths, where quartets of metalwrights strike in rhythmic harmony. Finished with natural tamarind fruit paste to achieve an unlacquered, warm moonlit glow that deepens with age.',
      image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'HERITAGE WOODWORK',
      region: 'Saharanpur & Jodhpur',
      materials: 'Reclaimed Teak & Slow-Grown Shisham',
      description:
        'Crafted from reclaimed architectural structural timbers salvaged from historic havelis and old dwellings. Hand-planed and conditioned with organic cold-pressed walnut oil and raw beeswax.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  return (
    <section id="our-craft" className="py-24 md:py-36 bg-[#FAF7F2] border-b border-[#E8E0D2]/70">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-3">
              ANCESTRAL TECHNIQUES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#23201D] font-light">
              Our Craft
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#7A746C] max-w-sm mt-4 md:mt-0 font-light tracking-wide">
            Four noble craft traditions, reinterpreted for quiet contemporary domestic spaces.
          </p>
        </div>

        {/* 4-Column Disciplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {craftDisciplines.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ECE4D6] mb-5">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#7A746C] font-semibold">
                  {item.region}
                </span>
                <h3 className="font-serif text-xl text-[#23201D] font-light">
                  {item.title}
                </h3>
                <span className="text-[11px] text-[#23201D] font-medium">
                  {item.materials}
                </span>
                <p className="text-xs text-[#7A746C] font-light leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
