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
    <section id="craft" className="relative py-28 md:py-36 bg-[#F2EBDD] text-[#241A14] overflow-hidden plaster-texture">
      {/* Background Architectural Jaali Pattern */}
      <div className="absolute inset-0 bg-jaali-subtle opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header with User's Exact Headline */}
        <div className="max-w-4xl mb-14">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-[#6E3027]" />
            <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#6E3027] font-semibold">
              THE METAMORPHOSIS OF STONE
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-[0.06em] text-[#241A14] font-light">
            THE HAND BEHIND <br />
            <span className="italic text-[#9B5540]">THE OBJECT.</span>
          </h2>

          <p className="font-serif italic text-lg sm:text-xl text-[#6E3027] mt-4">
            Six deliberate stages of hand reduction, sacred geometry, and river silt honing.
          </p>
        </div>

        {/* Stepper Navigation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-10 pb-6 border-b border-[#D8C5A5]">
          {CRAFT_PROCESS_STEPS.map((step, idx) => (
            <button
              key={step.step}
              onClick={() => setCurrentStepIndex(idx)}
              data-cursor="pointer"
              className={`p-3 text-left transition-all duration-300 border-l-2 ${
                currentStepIndex === idx
                  ? 'border-[#6E3027] bg-[#E7DBCA] text-[#241A14] font-semibold'
                  : 'border-[#D8C5A5] hover:border-[#B98B62] text-[#8C613C] hover:text-[#241A14]'
              }`}
            >
              <span className="text-[9px] font-sans font-bold tracking-[0.25em] text-[#6E3027] block">
                STAGE {step.step}
              </span>
              <span className="font-serif text-sm md:text-base font-medium tracking-wider block mt-0.5">
                {step.title}
              </span>
            </button>
          ))}
        </div>

        {/* Main Stage Theater View */}
        <div className="relative bg-[#F9F6F0] border border-[#B98B62] overflow-hidden shadow-[0_20px_50px_rgba(185,139,98,0.18)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
            
            {/* Left Photo Stage */}
            <div className="lg:col-span-7 relative min-h-[360px] lg:min-h-full overflow-hidden bg-[#E7DBCA]">
              <Image
                key={currentStep.imageUrl}
                src={currentStep.imageUrl}
                alt={currentStep.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center filter contrast-105 brightness-98 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241A14]/30 via-transparent to-transparent lg:hidden" />

              {/* Floating Stage Number */}
              <div className="absolute top-6 left-6 z-10">
                <span className="font-serif text-6xl md:text-8xl text-[#F2EBDD]/70 font-bold select-none drop-shadow-md">
                  {currentStep.step}
                </span>
              </div>

              {/* Atmospheric Audio Tag */}
              {currentStep.audioAtmosphere && (
                <div className="absolute bottom-6 left-6 z-10 text-[10px] font-sans tracking-[0.2em] text-[#241A14] uppercase bg-[#F2EBDD]/90 px-3 py-1.5 border border-[#B98B62] backdrop-blur-sm font-medium">
                  WORKSHOP ATMOSPHERE: {currentStep.audioAtmosphere}
                </div>
              )}
            </div>

            {/* Right Narrative Stage */}
            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between space-y-6 relative bg-[#FAF6F0]">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-sans tracking-[0.35em] text-[#6E3027] uppercase font-semibold block">
                    STAGE {currentStep.step} · {currentStep.stageName}
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#241A14] tracking-[0.06em] font-light mt-1.5">
                    {currentStep.title}
                  </h3>
                  <p className="font-serif italic text-base text-[#9B5540] mt-1">
                    {currentStep.subtitle}
                  </p>
                </div>

                <p className="text-sm font-sans text-[#524035] font-light leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Artisan Quote Box */}
                <div className="p-5 bg-[#EDE4D3] border-l-2 border-[#6E3027] space-y-2">
                  <div className="flex items-center space-x-2 text-[#6E3027]">
                    <Quote className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase tracking-[0.25em] font-bold">ORAL TRANSMISSION</span>
                  </div>
                  <blockquote className="font-serif italic text-sm text-[#241A14] leading-relaxed">
                    "{currentStep.artisanQuote}"
                  </blockquote>
                  <p className="text-[10px] tracking-[0.18em] text-[#8C613C] uppercase font-semibold">
                    — {currentStep.artisanRole}
                  </p>
                </div>

                {/* Hereditary Tools */}
                <div>
                  <div className="flex items-center space-x-2 text-[10px] font-sans uppercase tracking-[0.25em] text-[#8C613C] mb-2 font-semibold">
                    <Wrench className="w-3 h-3 text-[#6E3027]" />
                    <span>HEREDITARY TOOLS</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.toolsUsed.map((tool) => (
                      <span
                        key={tool}
                        className="text-[11px] font-sans px-2.5 py-1 bg-[#EDE4D3] border border-[#D8C5A5] text-[#241A14]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-[#D8C5A5] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrev}
                    data-cursor="pointer"
                    aria-label="Previous step"
                    className="p-3 border border-[#B98B62] bg-[#F2EBDD] text-[#241A14] hover:bg-[#6E3027] hover:text-[#F2EBDD] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    data-cursor="pointer"
                    aria-label="Next step"
                    className="p-3 border border-[#B98B62] bg-[#F2EBDD] text-[#241A14] hover:bg-[#6E3027] hover:text-[#F2EBDD] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  data-cursor="pointer"
                  className="text-xs font-sans tracking-[0.25em] uppercase text-[#6E3027] hover:text-[#241A14] font-semibold transition-colors"
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
