'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MATERIALS_DATA } from '@/data/materials';
import { MaterialSpec } from '@/types';
import ArchitecturalDivider from './ArchitecturalDivider';
import { Layers, Sparkles } from 'lucide-react';

export default function MaterialExplorer() {
  const [activeMaterial, setActiveMaterial] = useState<MaterialSpec>(MATERIALS_DATA[0]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <section className="relative py-28 md:py-36 bg-[#E7DBCA] text-[#241A14] overflow-hidden sandstone-wash">
      {/* Background Subtle Jaali Grid */}
      <div className="absolute inset-0 bg-jaali-warm opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <Layers className="w-4 h-4 text-[#6E3027]" />
            <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#6E3027] font-semibold">
              TACTILE MATERIALITY
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-[0.06em] text-[#241A14] font-light leading-tight">
            THE TACTILE TRINITY: <br />
            <span className="italic text-[#9B5540]">STONE, SILVER & MEMORY.</span>
          </h2>

          <p className="font-serif italic text-lg sm:text-xl text-[#6E3027] mt-4">
            No synthetic coatings. No acrylic varnishes. Pure physical geological truth.
          </p>
        </div>

        {/* Material Selector Triad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {MATERIALS_DATA.map((mat) => {
            const isSelected = activeMaterial.id === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => setActiveMaterial(mat)}
                onMouseEnter={() => setActiveMaterial(mat)}
                data-cursor="pointer"
                className={`p-6 sm:p-8 text-left transition-all duration-400 border relative overflow-hidden ${
                  isSelected
                    ? 'border-[#6E3027] bg-[#F2EBDD] shadow-[0_12px_28px_rgba(110,48,39,0.14)]'
                    : 'border-[#B98B62]/60 bg-[#EDE4D3]/70 hover:border-[#9B5540] text-[#524035]'
                }`}
              >
                {/* Active Indicator Top Line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#6E3027]" />
                )}

                <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-[#6E3027] block font-semibold">
                  DISCIPLINE {mat.id.toUpperCase()}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#241A14] tracking-[0.06em] mt-1 font-light">
                  {mat.name}
                </h3>
                <p className="font-serif italic text-xs text-[#8C613C] mt-2">
                  {mat.subhead}
                </p>
              </button>
            );
          })}
        </div>

        {/* Interactive Tactile Studio Box with Sunbeam Tracker */}
        <div
          onMouseMove={handleMouseMove}
          className="relative bg-[#F9F6F0] border border-[#B98B62] p-8 md:p-14 overflow-hidden rounded-sm shadow-[0_20px_50px_rgba(185,139,98,0.2)]"
        >
          {/* Subtle Warm Sunbeam following cursor */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60"
            style={{
              background: `radial-gradient(circle 380px at ${mousePos.x}% ${mousePos.y}%, rgba(216, 197, 165, 0.45), transparent 75%)`,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            
            {/* Macro Material Texture Image */}
            <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] w-full overflow-hidden border border-[#D8C5A5] bg-[#E7DBCA]">
              <Image
                key={activeMaterial.heroImage}
                src={activeMaterial.heroImage}
                alt={activeMaterial.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center filter contrast-105 transition-all duration-700 hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-[#F2EBDD]/90 backdrop-blur-sm border border-[#D8C5A5] text-[10px] tracking-[0.2em] text-[#6E3027] uppercase font-semibold">
                {activeMaterial.textureType.toUpperCase()} SURFACE EXPLORATION
              </div>
            </div>

            {/* Geological & Sensory Analysis */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-[10px] font-sans tracking-[0.35em] text-[#6E3027] uppercase font-semibold block">
                  GEOLOGICAL & METALLURGICAL GENEALOGY
                </span>
                <h4 className="font-serif text-3xl sm:text-4xl text-[#241A14] tracking-[0.06em] font-light mt-1">
                  {activeMaterial.name}
                </h4>
              </div>

              <p className="text-sm sm:text-base font-sans text-[#524035] font-light leading-relaxed">
                {activeMaterial.heritageStory}
              </p>

              {/* Tactile Profile */}
              <div className="p-5 bg-[#EDE4D3] border-l-2 border-[#6E3027] space-y-2">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#6E3027] font-bold block">
                  TACTILE SENSORY EXPERIENCE
                </span>
                <p className="font-serif italic text-sm text-[#241A14] leading-relaxed">
                  "{activeMaterial.tactileDescription}"
                </p>
              </div>

              {/* Inherent Traits */}
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#8C613C] font-semibold block mb-3">
                  INTRINSIC MATERIAL TRAITS
                </span>
                <ul className="space-y-2 text-xs font-sans text-[#524035]">
                  {activeMaterial.aestheticQualities.map((trait, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#9B5540] flex-shrink-0" />
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Historic Extraction Basins */}
              <div className="pt-4 border-t border-[#D8C5A5]">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#8C613C] font-semibold block mb-2">
                  HISTORIC EXTRACTION BASINS
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeMaterial.originRegions.map((region) => (
                    <span
                      key={region}
                      className="text-[11px] font-sans px-3 py-1 bg-[#EDE4D3] border border-[#D8C5A5] text-[#241A14]"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArchitecturalDivider variant="jaali" className="mt-20" />
    </section>
  );
}
