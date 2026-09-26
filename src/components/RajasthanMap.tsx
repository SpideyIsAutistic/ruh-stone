'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { RAJASTHAN_LOCATIONS } from '@/data/rajasthanLocations';
import { RajasthanLocation } from '@/types';
import ArchitecturalDivider from './ArchitecturalDivider';
import { Compass, Sparkles } from 'lucide-react';

interface RajasthanMapProps {
  onSelectArtifact?: (name: string) => void;
}

export default function RajasthanMap({ onSelectArtifact }: RajasthanMapProps) {
  const [activeLocation, setActiveLocation] = useState<RajasthanLocation>(RAJASTHAN_LOCATIONS[1]); // Default Jodhpur

  return (
    <section id="rajasthan" className="relative py-28 md:py-36 bg-[#080706] text-[#f4ecdf] overflow-hidden">
      {/* Background Cartographic Grid Texture */}
      <div className="absolute inset-0 bg-jaali-dense opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-[#bba172] text-[10px] tracking-[0.4em] uppercase font-sans mb-3">
            <Compass className="w-3.5 h-3.5 text-[#d4b584]" />
            <span>THE CARTOGRAPHY OF PROVENANCE</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#faf6f0] font-light tracking-[0.08em]">
            AN ARCHIVAL MAP OF RAJASTHAN
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-[#c2a37f] mt-3">
            "Every quarry, foundry, and courtyard tells a specific tactile truth."
          </p>
          <p className="text-xs font-sans tracking-[0.2em] uppercase text-[#835c40] mt-3">
            Hover over the ancient craft citadels to illuminate their geological lineages
          </p>
        </div>

        {/* Quick Location Pills for Mobile and Quick Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {RAJASTHAN_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActiveLocation(loc)}
              onMouseEnter={() => setActiveLocation(loc)}
              data-cursor="pointer"
              className={`px-4 py-2 text-xs font-sans tracking-[0.25em] uppercase border transition-all duration-300 ${
                activeLocation.id === loc.id
                  ? 'border-[#d4b584] bg-[#bba172]/20 text-[#faf6f0] shadow-[0_0_15px_rgba(212,181,132,0.25)]'
                  : 'border-[#2c2722] bg-[#141311]/60 text-[#c2a37f] hover:border-[#443c34] hover:text-[#f4ecdf]'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* Main Grid: Antique Illustrated Map (Left) + Collector's Provenance Dossier (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Map Illustrated SVG Container */}
          <div className="lg:col-span-7 relative bg-[#0e0d0c] border border-[#332d26] p-4 sm:p-8 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            {/* Antique Double Border */}
            <div className="relative border border-[#443c34]/50 p-2 sm:p-4 overflow-hidden">
              {/* Compass Rose */}
              <div className="absolute top-4 right-4 z-10 opacity-70 pointer-events-none hidden sm:block">
                <svg className="w-16 h-16 text-[#bba172]" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
                  <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" />
                  {/* Cardinal wind pointers */}
                  <polygon points="50,10 54,46 50,42 46,46" fill="#d4b584" />
                  <polygon points="50,90 54,54 50,58 46,54" fill="#a78056" />
                  <polygon points="10,50 46,54 42,50 46,46" fill="#a78056" />
                  <polygon points="90,50 54,54 58,50 54,46" fill="#d4b584" />
                  <text x="50" y="8" fill="#d4b584" fontSize="7" textAnchor="middle" fontFamily="serif">N</text>
                  <text x="50" y="99" fill="#a78056" fontSize="7" textAnchor="middle" fontFamily="serif">S</text>
                  <text x="5" y="52" fill="#a78056" fontSize="7" textAnchor="middle" fontFamily="serif">W</text>
                  <text x="96" y="52" fill="#d4b584" fontSize="7" textAnchor="middle" fontFamily="serif">E</text>
                </svg>
              </div>

              {/* Map Title Plaque */}
              <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <span className="text-[9px] uppercase font-sans tracking-[0.35em] text-[#835c40]">
                  ARCHIVAL CARTOGRAPHY
                </span>
                <p className="font-serif italic text-xs text-[#bba172]">
                  Terra Marwar & Mewar
                </p>
              </div>

              {/* Hand-Drawn Editorial Map SVG */}
              <svg
                viewBox="0 0 500 450"
                className="w-full h-auto max-h-[520px] select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Lat/Long Coordinate Grid */}
                <line x1="20" y1="100" x2="480" y2="100" stroke="#25221e" strokeWidth="0.5" strokeDasharray="3 4" />
                <line x1="20" y1="200" x2="480" y2="200" stroke="#25221e" strokeWidth="0.5" strokeDasharray="3 4" />
                <line x1="20" y1="300" x2="480" y2="300" stroke="#25221e" strokeWidth="0.5" strokeDasharray="3 4" />
                <line x1="20" y1="400" x2="480" y2="400" stroke="#25221e" strokeWidth="0.5" strokeDasharray="3 4" />

                <line x1="100" y1="20" x2="100" y2="430" stroke="#25221e" strokeWidth="0.5" strokeDasharray="3 4" />
                <line x1="200" y1="20" x2="200" y2="430" stroke="#25221e" strokeWidth="0.5" strokeDasharray="3 4" />
                <line x1="300" y1="20" x2="300" y2="430" stroke="#25221e" strokeWidth="0.5" strokeDasharray="3 4" />
                <line x1="400" y1="20" x2="400" y2="430" stroke="#25221e" strokeWidth="0.5" strokeDasharray="3 4" />

                {/* Hand-Drawn Rajasthan Territorial Outline */}
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
                  stroke="#443c34"
                  strokeWidth="1.5"
                  fill="#12100e"
                  fillOpacity="0.8"
                />

                {/* Inner Territorial Contour lines */}
                <path
                  d="M185 45 C245 55, 305 35, 355 65 C395 85, 432 122, 415 178 C405 208, 432 238, 405 285 C385 315, 355 352, 315 372 C285 392, 238 422, 208 412 C172 402, 135 375, 142 328 C152 288, 85 258, 55 208 C28 162, 65 115, 112 85 Z"
                  stroke="#332d26"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />

                {/* The Great Thar Desert Terrain Dunes (North-West) */}
                <path d="M70 120 Q 90 115, 110 120" stroke="#3d3429" strokeWidth="0.7" />
                <path d="M80 140 Q 100 135, 120 140" stroke="#3d3429" strokeWidth="0.7" />
                <path d="M60 160 Q 80 155, 100 160" stroke="#3d3429" strokeWidth="0.7" />
                <path d="M90 180 Q 110 175, 130 180" stroke="#3d3429" strokeWidth="0.7" />
                <path d="M120 130 Q 140 125, 160 130" stroke="#3d3429" strokeWidth="0.7" />
                <text x="80" y="105" fill="#5a4835" fontSize="8" letterSpacing="3" fontFamily="sans-serif">THAR DESERT</text>

                {/* Aravalli Range Mountain Ridges (Diagonal Center-South) */}
                <path d="M180 340 L 220 280 L 260 230 L 310 170 L 350 120" stroke="#524434" strokeWidth="1.2" strokeDasharray="3 5" />
                <path d="M190 350 L 230 290 L 270 240 L 320 180 L 360 130" stroke="#524434" strokeWidth="0.8" strokeDasharray="2 4" />
                <text x="280" y="275" fill="#695642" fontSize="7" transform="rotate(-40 280 275)" letterSpacing="3" fontFamily="serif">ARAVALLI RANGE</text>

                {/* Animated Connection Line from active coordinate to anchor point */}
                <circle
                  cx={(activeLocation.coordinates.x / 100) * 500}
                  cy={(activeLocation.coordinates.y / 100) * 450}
                  r="24"
                  stroke="#d4b584"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  className="animate-spin"
                  style={{ animationDuration: '16s', transformOrigin: `${(activeLocation.coordinates.x / 100) * 500}px ${(activeLocation.coordinates.y / 100) * 450}px` }}
                />

                {/* Interactive Citadel Nodes */}
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
                      {/* Pulse Ring when active */}
                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="16"
                          fill="none"
                          stroke="#d4b584"
                          strokeWidth="1.2"
                          opacity="0.7"
                          className="animate-ping"
                        />
                      )}

                      {/* Outer Diamond */}
                      <rect
                        x={cx - 6}
                        y={cy - 6}
                        width="12"
                        height="12"
                        transform={`rotate(45 ${cx} ${cy})`}
                        fill={isSelected ? '#d4b584' : '#1f1a17'}
                        stroke={isSelected ? '#faf6f0' : '#bba172'}
                        strokeWidth="1.2"
                      />

                      {/* Inner Pinpoint */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="2.5"
                        fill={isSelected ? '#0e0d0c' : '#d4b584'}
                      />

                      {/* Citadel Name Label */}
                      <text
                        x={cx}
                        y={cy + 22}
                        textAnchor="middle"
                        fill={isSelected ? '#faf6f0' : '#b58d64'}
                        fontSize="10"
                        fontFamily="serif"
                        letterSpacing="1.5"
                        fontWeight={isSelected ? '600' : '400'}
                        className="transition-colors duration-200"
                      >
                        {loc.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right Column: Collector's Provenance Story Dossier */}
          <div className="lg:col-span-5 bg-[#141311] border border-[#332d26] p-8 md:p-10 relative shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            {/* Top Ornamental Edge */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4b584] to-transparent" />

            {/* Location Tag */}
            <div className="flex items-center justify-between pb-6 border-b border-[#2c2722]">
              <div>
                <span className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#a17652]">
                  CRAFT CAPITAL PROVENANCE
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-[#faf6f0] tracking-[0.1em] mt-1">
                  {activeLocation.name}
                </h3>
              </div>
              <Sparkles className="w-5 h-5 text-[#d4b584]" />
            </div>

            {/* Tagline & Quotation */}
            <div className="py-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#d4b584] font-medium">
                {activeLocation.tagline}
              </p>
              <blockquote className="font-serif italic text-xl text-[#e7dac5] mt-3 border-l-2 border-[#bba172] pl-4 leading-relaxed">
                "{activeLocation.quote}"
              </blockquote>
            </div>

            {/* Editorial Story */}
            <p className="text-sm font-sans text-[#c2a37f] font-light leading-relaxed mb-6">
              {activeLocation.story}
            </p>

            {/* Extracted Minerals & Materials */}
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#835c40] font-sans block mb-2">
                NATIVE EXTRACTION & METALS
              </span>
              <div className="flex flex-wrap gap-2">
                {activeLocation.materials.map((mat) => (
                  <span
                    key={mat}
                    className="text-[11px] font-sans px-3 py-1 bg-[#1c1a18] border border-[#2c2722] text-[#d5c0a2]"
                  >
                    {mat}
                  </span>
                ))}
              </div>
            </div>

            {/* Guild Lineage Note */}
            <div className="p-4 bg-[#0e0d0c] border border-[#2c2722] text-xs text-[#a17652] leading-relaxed mb-6">
              <strong className="text-[#d4b584] block mb-1 uppercase tracking-[0.15em] text-[10px]">
                HEREDITARY GUILD
              </strong>
              {activeLocation.artisanLegacy}
            </div>

            {/* Featured Artifact Preview Link */}
            <div className="pt-4 border-t border-[#2c2722] flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#835c40]">
                  SIGNATURE ARTIFACT
                </span>
                <p className="font-serif text-base text-[#faf6f0]">
                  {activeLocation.featuredArtifactName}
                </p>
              </div>
              <a
                href="#collection"
                onClick={() => onSelectArtifact?.(activeLocation.featuredArtifactName)}
                className="text-xs uppercase font-sans tracking-[0.2em] text-[#d4b584] hover:text-[#faf6f0] underline underline-offset-4"
                data-cursor="pointer"
              >
                VIEW PIECE →
              </a>
            </div>
          </div>
        </div>
      </div>

      <ArchitecturalDivider variant="arch" className="mt-20" />
    </section>
  );
}
