'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <section className="relative w-full h-[60vh] min-h-[480px] max-h-[700px] overflow-hidden bg-[#ECE4D6]">
      {/* Still Life of Handcrafted Decor Objects (Ventura Inspired Layout) */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/newsletter-bring-craft-home.jpg"
          alt="Handcrafted gold leaf embossed platter and spoon in red velvet atelier gift box"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter blur-[3px]"
        />
        {/* Soft atmospheric overlay */}
        <div className="absolute inset-0 bg-[#23201D]/55" />
      </div>

      {/* Centered Editorial Content */}
      <div className="relative h-full max-w-[800px] mx-auto px-6 flex flex-col items-center justify-center text-center text-[#FAF7F2]">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#FAF7F2]/80 font-medium block mb-3">
          SEASONAL DISPATCHES
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAF7F2] font-light tracking-wide mb-3">
          BRING CRAFT HOME.
        </h2>

        <p className="text-xs sm:text-sm text-[#FAF7F2]/85 font-light tracking-wide max-w-md mb-8">
          Discover objects shaped by material, tradition and human hands. Receive small-batch releases and artisan monographs.
        </p>

        {/* Ventura-Style Clean Form */}
        {subscribed ? (
          <div className="flex items-center space-x-2 bg-[#FAF7F2]/95 text-[#23201D] px-6 py-3.5 border border-[#FAF7F2] text-xs font-sans tracking-widest uppercase">
            <Check className="w-4 h-4 text-[#23201D]" />
            <span>DISPATCH CONFIRMED · WELCOME TO RUH STONE</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              aria-label="Email address for craft dispatches"
              className="flex-1 bg-[#FAF7F2] text-[#23201D] placeholder-[#7A746C] text-xs font-sans px-4 py-3.5 border-none focus:outline-none focus:ring-1 focus:ring-[#23201D]"
            />
            <button
              type="submit"
              className="bg-[#3A3027] hover:bg-[#23201D] text-[#FAF7F2] text-[11px] font-sans tracking-[0.2em] uppercase px-6 py-3.5 transition-colors whitespace-nowrap"
            >
              EXPLORE COLLECTION →
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
