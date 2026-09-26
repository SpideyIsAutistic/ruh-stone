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
    <section className="relative py-28 md:py-36 bg-[#0c0b0a] text-[#f4ecdf] overflow-hidden">
      {/* Background Dynamic Material Class */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${activeMaterial.bgClass} opacity-60 pointer-events-none`}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <Layers className="w-4 h-4 text-[#bba172]" />
            <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#bba172] font-semibold">
              TACTILE MATERIALITY
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-[0.06em] text-[#faf6f0] font-light leading-tight">
            THE TACTILE TRINITY: <br />
            <span className="italic text-[#d4b584]">STONE, SILVER & MEMORY.</span>
          </h2>

          <p className="font-serif italic text-lg sm:text-xl text-[#c2a37f] mt-4">
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
                className={`p-6 sm:p-8 text-left transition-all duration-500 border relative overflow-hidden ${
                  isSelected
                    ? 'border-[#d4b584] bg-[#1a1815] shadow-[0_12px_32px_rgba(0,0,0,0.7)]'
                    : 'border-[#2c2722] bg-[#121110]/80 hover:border-[#443c34] text-[#835c40]'
                }`}
              >
                {/* Active Indicator Top Line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4b584] to-transparent" />
                )}

                <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-[#bba172] block">
                  CATEGORY {mat.id.toUpperCase()}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#faf6f0] tracking-[0.1em] mt-1 font-light">
                  {mat.name}
                </h3>
                <p className="font-serif italic text-xs text-[#c2a37f] mt-2">
                  {mat.subhead}
                </p>
              </button>
            );
          })}
        </div>

        {/* Interactive Material Theater Box with Specular Spotlight */}
        <div
          onMouseMove={handleMouseMove}
          className="relative bg-[#141311] border border-[#332d26] p-8 md:p-14 overflow-hidden rounded-sm shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
        >
          {/* Specular Spotlight Gradient tracking user cursor */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-40"
            style={{
              background: `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, ${
                activeMaterial.textureType === 'silver'
                  ? 'rgba(255, 255, 255, 0.15)'
                  : activeMaterial.textureType === 'sandstone'
                  ? 'rgba(212, 181, 132, 0.18)'
                  : 'rgba(186, 99, 70, 0.15)'
              }, transparent 80%)`,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            {/* Macro Material Texture Image */}
            <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] w-full overflow-hidden border border-[#332d26] bg-[#0c0b0a]">
              <Image
                key={activeMaterial.heroImage}
                src={activeMaterial.heroImage}
                alt={activeMaterial.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center filter brightness-95 contrast-105 transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-radial from-transparent via-[#0c0b0a]/20 to-[#0c0b0a]/70 pointer-events-none" />
              <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-[#0c0b0a]/80 backdrop-blur-sm border border-[#2c2722] text-[10px] tracking-[0.2em] text-[#d4b584] uppercase">
                {activeMaterial.textureType.toUpperCase()} SURFACE EXPLORATION
              </div>
            </div>

            {/* Geological & Sensory Analysis */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-[10px] font-sans tracking-[0.35em] text-[#d4b584] uppercase font-semibold block">
                  GEOLOGICAL GENEALOGY
                </span>
                <h4 className="font-serif text-3xl sm:text-4xl text-[#faf6f0] tracking-[0.06em] font-light mt-1">
                  {activeMaterial.name}
                </h4>
              </div>

              <p className="text-sm sm:text-base font-sans text-[#c2a37f] font-light leading-relaxed">
                {activeMaterial.heritageStory}
              </p>

              {/* Tactile Contact Profile */}
              <div className="p-5 bg-[#0e0d0c] border border-[#2c2722] space-y-2">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#d4b584] font-semibold block">
                  TACTILE SENSORY EXPERIENCE
                </span>
                <p className="font-serif italic text-sm text-[#faf6f0] leading-relaxed">
                  "{activeMaterial.tactileDescription}"
                </p>
              </div>

              {/* Inherent Aesthetic Qualities */}
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#835c40] font-semibold block mb-3">
                  INTRINSIC MATERIAL TRAITS
                </span>
                <ul className="space-y-2 text-xs font-sans text-[#c2a37f]">
                  {activeMaterial.aestheticQualities.map((trait, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4b584] flex-shrink-0" />
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Origin Region Chips */}
              <div className="pt-4 border-t border-[#26221d]">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#835c40] block mb-2">
                  HISTORIC EXTRACTION BASINS
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeMaterial.originRegions.map((region) => (
                    <span
                      key={region}
                      className="text-[11px] font-sans px-3 py-1 bg-[#1a1815] border border-[#2c2722] text-[#d5c0a2]"
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
