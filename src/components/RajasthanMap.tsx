'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { RAJASTHAN_LOCATIONS } from '@/data/rajasthanLocations';
import { RajasthanLocation } from '@/types';
import ArchitecturalDivider from './ArchitecturalDivider';
import { Compass, BookOpen } from 'lucide-react';

interface RajasthanMapProps {
  onSelectArtifact?: (name: string) => void;
}

export default function RajasthanMap({ onSelectArtifact }: RajasthanMapProps) {
  const [activeLocation, setActiveLocation] = useState<RajasthanLocation>(RAJASTHAN_LOCATIONS[1]); // Default Jodhpur

  return (
    <section id="rajasthan" className="relative py-28 md:py-36 bg-[#EDE4D3] text-[#241A14] overflow-hidden wasli-paper">
      {/* Background Cartographic Grid Texture */}
      <div className="absolute inset-0 bg-jaali-subtle opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-[#6E3027] text-[10px] tracking-[0.4em] uppercase font-sans mb-3 font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>COLLECTOR'S TRAVEL JOURNAL</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#241A14] font-light tracking-[0.06em]">
            AN ILLUSTRATED MAP OF RAJASTHAN
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-[#6E3027] mt-3">
            "Every quarry, foundry, and courtyard tells a specific tactile truth."
          </p>
          <p className="text-xs font-sans tracking-[0.2em] uppercase text-[#8C613C] mt-2 font-medium">
            Explore the ancient craft hubs to reveal their geological and metallurgical lineages
          </p>
        </div>

        {/* Quick Location Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {RAJASTHAN_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActiveLocation(loc)}
              onMouseEnter={() => setActiveLocation(loc)}
              data-cursor="pointer"
              className={`px-4 py-2 text-xs font-sans tracking-[0.2em] uppercase border transition-all duration-300 font-medium ${
                activeLocation.id === loc.id
                  ? 'border-[#6E3027] bg-[#6E3027] text-[#F2EBDD] shadow-[0_4px_12px_rgba(110,48,39,0.2)]'
                  : 'border-[#D8C5A5] bg-[#F2EBDD] text-[#524035] hover:border-[#B98B62] hover:text-[#241A14]'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* Main Grid: Antique Illustrated Map (Left) + Collector's Journal Dossier (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Illustrated Hand-Drawn Map (Left) */}
          <div className="lg:col-span-7 relative bg-[#F5EFE6] border border-[#B98B62] p-5 sm:p-8 rounded-sm shadow-[0_16px_40px_rgba(185,139,98,0.2)]">
            <div className="relative border border-[#D8C5A5] p-3 sm:p-5 overflow-hidden bg-[#FAF6F0]">
              
              {/* Antique Compass Rose */}
              <div className="absolute top-4 right-4 z-10 opacity-80 pointer-events-none hidden sm:block">
                <svg className="w-16 h-16 text-[#6E3027]" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="45" stroke="#B98B62" strokeWidth="0.8" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="28" stroke="#D8C5A5" strokeWidth="0.5" />
                  <polygon points="50,10 54,46 50,42 46,46" fill="#6E3027" />
                  <polygon points="50,90 54,54 50,58 46,54" fill="#9B5540" />
                  <polygon points="10,50 46,54 42,50 46,46" fill="#9B5540" />
                  <polygon points="90,50 54,54 58,50 54,46" fill="#6E3027" />
                  <text x="50" y="8" fill="#6E3027" fontSize="7" textAnchor="middle" fontFamily="serif" fontWeight="bold">N</text>
                  <text x="50" y="99" fill="#9B5540" fontSize="7" textAnchor="middle" fontFamily="serif">S</text>
                  <text x="5" y="52" fill="#9B5540" fontSize="7" textAnchor="middle" fontFamily="serif">W</text>
                  <text x="96" y="52" fill="#6E3027" fontSize="7" textAnchor="middle" fontFamily="serif">E</text>
                </svg>
              </div>

              {/* Map Title Plaque */}
              <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <span className="text-[9px] uppercase font-sans tracking-[0.3em] text-[#8C613C] font-semibold">
                  HISTORIC TERRITORIES
                </span>
                <p className="font-serif italic text-xs text-[#6E3027]">
                  Marwar · Mewar · Shekhawati
                </p>
              </div>

              {/* Hand-Drawn SVG Map with Warm Inks */}
              <svg
                viewBox="0 0 500 450"
                className="w-full h-auto max-h-[520px] select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Lat/Long Coordinate Grid */}
                <line x1="20" y1="100" x2="480" y2="100" stroke="#E7DBCA" strokeWidth="0.8" strokeDasharray="3 4" />
                <line x1="20" y1="200" x2="480" y2="200" stroke="#E7DBCA" strokeWidth="0.8" strokeDasharray="3 4" />
                <line x1="20" y1="300" x2="480" y2="300" stroke="#E7DBCA" strokeWidth="0.8" strokeDasharray="3 4" />
                <line x1="20" y1="400" x2="480" y2="400" stroke="#E7DBCA" strokeWidth="0.8" strokeDasharray="3 4" />

                <line x1="100" y1="20" x2="100" y2="430" stroke="#E7DBCA" strokeWidth="0.8" strokeDasharray="3 4" />
                <line x1="200" y1="20" x2="200" y2="430" stroke="#E7DBCA" strokeWidth="0.8" strokeDasharray="3 4" />
                <line x1="300" y1="20" x2="300" y2="430" stroke="#E7DBCA" strokeWidth="0.8" strokeDasharray="3 4" />
                <line x1="400" y1="20" x2="400" y2="430" stroke="#E7DBCA" strokeWidth="0.8" strokeDasharray="3 4" />

                {/* Hand-Drawn Rajasthan Territorial Outline in Walnut & Cinnabar Ink */}
                <path
                  d="M190 40 
                     C250 50, 310 30, 360 60 
                     C400 80, 440 120, 420 180 
                     C410 210, 440 240, 410 290 
                     C390 320, 360 360, 320 380 
                     C290 400, 240 430, 210 420 
                     C170 410, 130 380, 140 330 
                     C150 290, 80 260, 50 210 
                     C20 160, 60 110, 110 80 
                     C140 60, 170 50, 190 40 Z"
                  stroke="#9B5540"
                  strokeWidth="1.8"
                  fill="#EDE4D3"
                  fillOpacity="0.75"
                />

                {/* Inner Territorial Contour */}
                <path
                  d="M185 45 C245 55, 305 35, 355 65 C395 85, 432 122, 415 178 C405 208, 432 238, 405 285 C385 315, 355 352, 315 372 C285 392, 238 422, 208 412 C172 402, 135 375, 142 328 C152 288, 85 258, 55 208 C28 162, 65 115, 112 85 Z"
                  stroke="#B98B62"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                />

                {/* Thar Desert Dunes (West) */}
                <path d="M70 120 Q 90 115, 110 120" stroke="#C9A480" strokeWidth="1" />
                <path d="M80 140 Q 100 135, 120 140" stroke="#C9A480" strokeWidth="1" />
                <path d="M60 160 Q 80 155, 100 160" stroke="#C9A480" strokeWidth="1" />
                <path d="M90 180 Q 110 175, 130 180" stroke="#C9A480" strokeWidth="1" />
                <path d="M120 130 Q 140 125, 160 130" stroke="#C9A480" strokeWidth="1" />
                <text x="80" y="105" fill="#9B5540" fontSize="9" letterSpacing="3" fontFamily="sans-serif" fontWeight="600">THAR DESERT</text>

                {/* Aravalli Range Mountain Ridges */}
                <path d="M180 340 L 220 280 L 260 230 L 310 170 L 350 120" stroke="#8C613C" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M190 350 L 230 290 L 270 240 L 320 180 L 360 130" stroke="#B98B62" strokeWidth="1" strokeDasharray="3 3" />
                <text x="280" y="275" fill="#6E3027" fontSize="8" transform="rotate(-40 280 275)" letterSpacing="3" fontFamily="serif" fontWeight="bold">ARAVALLI RANGE</text>

                {/* Active Location Halo Ring */}
                <circle
                  cx={(activeLocation.coordinates.x / 100) * 500}
                  cy={(activeLocation.coordinates.y / 100) * 450}
                  r="20"
                  stroke="#6E3027"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Citadel Nodes */}
                {RAJASTHAN_LOCATIONS.map((loc) => {
                  const cx = (loc.coordinates.x / 100) * 500;
                  const cy = (loc.coordinates.y / 100) * 450;
                  const isSelected = activeLocation.id === loc.id;

                  return (
                    <g
                      key={loc.id}
                      className="cursor-pointer transition-transform duration-300"
                      onClick={() => setActiveLocation(loc)}
                      onMouseEnter={() => setActiveLocation(loc)}
                    >
                      {/* Outer Diamond Marker */}
                      <rect
                        x={cx - 6}
                        y={cy - 6}
                        width="12"
                        height="12"
                        transform={`rotate(45 ${cx} ${cy})`}
                        fill={isSelected ? '#6E3027' : '#F2EBDD'}
                        stroke={isSelected ? '#241A14' : '#9B5540'}
                        strokeWidth="1.5"
                      />

                      {/* Inner Pinpoint */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="2.5"
                        fill={isSelected ? '#F2EBDD' : '#6E3027'}
                      />

                      {/* City Name Label */}
                      <text
                        x={cx}
                        y={cy + 20}
                        textAnchor="middle"
                        fill={isSelected ? '#6E3027' : '#241A14'}
                        fontSize="11"
                        fontFamily="serif"
                        letterSpacing="1.5"
                        fontWeight={isSelected ? 'bold' : '600'}
                      >
                        {loc.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right Column: Collector's Travel Journal Dossier */}
          <div className="lg:col-span-5 bg-[#F9F6F0] border border-[#B98B62] p-8 md:p-10 relative shadow-[0_16px_40px_rgba(36,26,20,0.1)]">
            {/* Top Cinnabar Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6E3027] to-transparent" />

            {/* Header with Wax Stamp Motif */}
            <div className="flex items-center justify-between pb-5 border-b border-[#D8C5A5]">
              <div>
                <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#6E3027] font-semibold">
                  PROVENANCE DOSSIER
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-[#241A14] tracking-[0.06em] mt-1 font-light">
                  {activeLocation.name}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#6E3027] flex items-center justify-center text-[#6E3027] text-xs font-serif font-bold">
                RUH
              </div>
            </div>

            {/* Editorial Quote */}
            <div className="py-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#9B5540] font-semibold">
                {activeLocation.tagline}
              </p>
              <blockquote className="font-serif italic text-xl text-[#241A14] mt-2.5 border-l-2 border-[#6E3027] pl-4 leading-relaxed">
                "{activeLocation.quote}"
              </blockquote>
            </div>

            {/* Curatorial Story */}
            <p className="text-sm font-sans text-[#524035] font-light leading-relaxed mb-6">
              {activeLocation.story}
            </p>

            {/* Extracted Stone & Metals */}
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C613C] font-semibold block mb-2 font-sans">
                NATIVE EXTRACTION & METALS
              </span>
              <div className="flex flex-wrap gap-2">
                {activeLocation.materials.map((mat) => (
                  <span
                    key={mat}
                    className="text-[11px] font-sans px-3 py-1 bg-[#EDE4D3] border border-[#D8C5A5] text-[#241A14]"
                  >
                    {mat}
                  </span>
                ))}
              </div>
            </div>

            {/* Hereditary Guild Lineage */}
            <div className="p-4 bg-[#EDE4D3]/80 border border-[#D8C5A5] text-xs text-[#524035] leading-relaxed mb-6">
              <strong className="text-[#6E3027] block mb-1 uppercase tracking-[0.15em] text-[10px]">
                HEREDITARY GUILD LINEAGE
              </strong>
              {activeLocation.artisanLegacy}
            </div>

            {/* Featured Artifact Preview Link */}
            <div className="pt-4 border-t border-[#D8C5A5] flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#8C613C] font-semibold">
                  SIGNATURE ARTIFACT
                </span>
                <p className="font-serif text-base text-[#241A14]">
                  {activeLocation.featuredArtifactName}
                </p>
              </div>
              <a
                href="#collection"
                onClick={() => onSelectArtifact?.(activeLocation.featuredArtifactName)}
                className="text-xs uppercase font-sans tracking-[0.2em] text-[#6E3027] hover:text-[#241A14] font-semibold underline underline-offset-4"
                data-cursor="pointer"
              >
                VIEW OBJECT →
              </a>
            </div>
          </div>
        </div>
      </div>

      <ArchitecturalDivider variant="jaali" className="mt-20" />
    </section>
  );
}
