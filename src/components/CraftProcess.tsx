'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CRAFT_PROCESS_STEPS } from '@/data/craftProcess';
import ArchitecturalDivider from './ArchitecturalDivider';
import { ChevronRight, ChevronLeft, Wrench, Quote } from 'lucide-react';

export default function CraftProcess() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = CRAFT_PROCESS_STEPS[currentStepIndex];

  const handleNext = () => {
    setCurrentStepIndex((prev) => (prev < CRAFT_PROCESS_STEPS.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : CRAFT_PROCESS_STEPS.length - 1));
  };

  return (
    <section id="craft" className="relative py-28 md:py-36 bg-[#080706] text-[#f4ecdf] overflow-hidden">
      {/* Background Ambience Texture */}
      <div className="absolute inset-0 bg-jaali opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-4xl mb-14">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-[#bba172]" />
            <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#bba172] font-semibold">
              THE METAMORPHOSIS OF STONE
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-[0.06em] text-[#faf6f0] font-light">
            THE HAND BEHIND <br />
            <span className="italic text-[#d4b584]">THE STONE.</span>
          </h2>

          <p className="font-serif italic text-lg sm:text-xl text-[#c2a37f] mt-4">
            Six deliberate stages of hand reduction, sacred geometry, and river silt honing.
          </p>
        </div>

        {/* Stepper Navigation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-10 pb-6 border-b border-[#2c2722]">
          {CRAFT_PROCESS_STEPS.map((step, idx) => (
            <button
              key={step.step}
              onClick={() => setCurrentStepIndex(idx)}
              data-cursor="pointer"
              className={`p-3 text-left transition-all duration-300 border-l-2 ${
                currentStepIndex === idx
                  ? 'border-[#d4b584] bg-[#1a1815] text-[#faf6f0]'
                  : 'border-[#2c2722] hover:border-[#443c34] text-[#835c40] hover:text-[#c2a37f]'
              }`}
            >
              <span className="text-[9px] font-sans font-bold tracking-[0.25em] text-[#d4b584] block">
                STAGE {step.step}
              </span>
              <span className="font-serif text-sm md:text-base font-medium tracking-wider block mt-0.5">
                {step.title}
              </span>
            </button>
          ))}
        </div>

        {/* Main Stage Theater View */}
        <div className="relative bg-[#141311] border border-[#332d26] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
            {/* Left Photo Stage with Atmospheric Depth */}
            <div className="lg:col-span-7 relative min-h-[360px] lg:min-h-full overflow-hidden bg-[#0c0b0a]">
              <Image
                key={currentStep.imageUrl}
                src={currentStep.imageUrl}
                alt={currentStep.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center filter brightness-90 contrast-105 transition-all duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141311] via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#141311] hidden lg:block" />

              {/* Floating Stage Number */}
              <div className="absolute top-6 left-6 z-10">
                <span className="font-serif text-6xl md:text-8xl text-[#faf6f0]/20 font-bold select-none">
                  {currentStep.step}
                </span>
              </div>

              {/* Atmospheric Audio Descriptor */}
              {currentStep.audioAtmosphere && (
                <div className="absolute bottom-6 left-6 z-10 text-[10px] font-sans tracking-[0.2em] text-[#d4b584] uppercase bg-[#0c0b0a]/80 px-3 py-1.5 border border-[#332d26] backdrop-blur-sm">
                  ACOUSTIC ATMOSPHERE: {currentStep.audioAtmosphere}
                </div>
              )}
            </div>

            {/* Right Narrative Stage */}
            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between space-y-8 relative">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-sans tracking-[0.35em] text-[#d4b584] uppercase font-semibold block">
                    STAGE {currentStep.step} · {currentStep.stageName}
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#faf6f0] tracking-[0.06em] font-light mt-2">
                    {currentStep.title}
                  </h3>
                  <p className="font-serif italic text-base text-[#c2a37f] mt-1">
                    {currentStep.subtitle}
                  </p>
                </div>

                <p className="text-sm font-sans text-[#c2a37f] font-light leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Artisan Quote Box */}
                <div className="p-5 bg-[#0e0d0c] border-l-2 border-[#bba172] space-y-2">
                  <div className="flex items-center space-x-2 text-[#bba172]">
                    <Quote className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase tracking-[0.25em]">ORAL TRANSMISSION</span>
                  </div>
                  <blockquote className="font-serif italic text-sm text-[#faf6f0] leading-relaxed">
                    "{currentStep.artisanQuote}"
                  </blockquote>
                  <p className="text-[10px] tracking-[0.18em] text-[#835c40] uppercase">
                    — {currentStep.artisanRole}
                  </p>
                </div>

                {/* Forged Tools Used */}
                <div>
                  <div className="flex items-center space-x-2 text-[10px] font-sans uppercase tracking-[0.25em] text-[#835c40] mb-2">
                    <Wrench className="w-3 h-3 text-[#bba172]" />
                    <span>HEREDITARY TOOLS UTILIZED</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.toolsUsed.map((tool) => (
                      <span
                        key={tool}
                        className="text-[11px] font-sans px-2.5 py-1 bg-[#1a1815] border border-[#2c2722] text-[#d5c0a2]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="pt-6 border-t border-[#26221d] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrev}
                    data-cursor="pointer"
                    aria-label="Previous craftsmanship step"
                    className="p-3 border border-[#332d26] bg-[#0c0b0a] text-[#c2a37f] hover:text-[#faf6f0] hover:border-[#bba172] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    data-cursor="pointer"
                    aria-label="Next craftsmanship step"
                    className="p-3 border border-[#332d26] bg-[#0c0b0a] text-[#c2a37f] hover:text-[#faf6f0] hover:border-[#bba172] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  data-cursor="pointer"
                  className="text-xs font-sans tracking-[0.25em] uppercase text-[#d4b584] hover:text-[#faf6f0] transition-colors"
                >
                  {currentStepIndex === CRAFT_PROCESS_STEPS.length - 1
                    ? 'RESTART PROCESS →'
                    : 'NEXT STAGE →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArchitecturalDivider variant="rosette" className="mt-20" />
    </section>
  );
}
