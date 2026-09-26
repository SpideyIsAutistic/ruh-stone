'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Menu, X, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  acquisitionCount: number;
  onOpenAcquisitionDrawer: () => void;
}

export default function Navbar({
  acquisitionCount,
  onOpenAcquisitionDrawer,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Web Audio subtle ambient haveli harmonic resonance
  const toggleAmbientSound = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      setAudioCtx(ctx);

      // Play soft warm chime upon initiation
      playHarmonicChime(ctx, 432); // warm resonant A frequency
      setIsAudioActive(true);
    } else {
      if (isAudioActive) {
        audioCtx.suspend();
        setIsAudioActive(false);
      } else {
        audioCtx.resume();
        playHarmonicChime(audioCtx, 528); // gentle activation chime
        setIsAudioActive(true);
      }
    }
  };

  const playHarmonicChime = (ctx: AudioContext, freq: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    } catch {
      // Audio context might be restricted
    }
  };

  const navItems = [
    { label: 'COLLECTION', href: '#collection' },
    { label: 'CRAFT', href: '#craft' },
    { label: 'OUR STORY', href: '#story' },
    { label: 'RAJASTHAN', href: '#rajasthan' },
    { label: 'JOURNAL', href: '#journal' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${
          scrolled
            ? 'bg-[#0d0c0b]/92 backdrop-blur-md border-b border-[#2c2722]/80 shadow-[0_12px_32px_rgba(0,0,0,0.7)] py-4'
            : 'bg-gradient-to-b from-[#080706]/90 via-[#080706]/40 to-transparent py-6 md:py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Mark */}
          <Link
            href="#"
            className="group flex flex-col items-start focus:outline-none"
            data-cursor="pointer"
          >
            <span className="font-serif text-xl md:text-2xl tracking-[0.25em] text-[#f4ecdf] font-light group-hover:text-[#d4b584] transition-colors duration-300">
              RUH STONE
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#b58d64] font-medium -mt-0.5">
              SOUL IN STONE
            </span>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-10 text-[11px] font-sans tracking-[0.28em] font-medium text-[#c2a37f]">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                data-cursor="pointer"
                className="relative py-1 text-[#d5c0a2] hover:text-[#f4ecdf] transition-colors duration-300 tracking-[0.28em] uppercase group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#d4b584] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5 md:space-x-7">
            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleAmbientSound}
              aria-label={isAudioActive ? 'Mute ambient sound' : 'Enable ambient sound'}
              data-cursor="pointer"
              className="p-2 text-[#c2a37f] hover:text-[#d4b584] transition-colors duration-300 focus:outline-none flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase"
              title={isAudioActive ? 'Haveli chime active' : 'Experience ambient resonance'}
            >
              {isAudioActive ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#d4b584]" />
                  <span className="hidden sm:inline-block text-[9px] text-[#d4b584]">RESONANCE ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#835c40]" />
                  <span className="hidden sm:inline-block text-[9px] text-[#835c40]">SOUND</span>
                </>
              )}
            </button>

            {/* Collection Inquiry Bag Trigger */}
            <button
              onClick={onOpenAcquisitionDrawer}
              data-cursor="pointer"
              aria-label="View curated acquisition inquiry"
              className="relative p-2.5 text-[#f4ecdf] hover:text-[#d4b584] transition-colors duration-300 focus:outline-none flex items-center space-x-2 border border-[#443c34] hover:border-[#bba172] bg-[#171513]/60 px-4 py-2 rounded-sm"
            >
              <ShoppingBag className="w-4 h-4 text-[#d4b584]" />
              <span className="hidden sm:inline-block text-[10px] font-sans tracking-[0.25em] text-[#d5c0a2] uppercase">
                INQUIRY
              </span>
              {acquisitionCount > 0 && (
                <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-[#8f4832] text-[#faf6f0] text-[10px] font-bold flex items-center justify-center -top-1.5 -right-1.5 border border-[#3b161b]">
                  {acquisitionCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-cursor="pointer"
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-[#f4ecdf] hover:text-[#d4b584] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden bg-[#0a0908]/98 backdrop-blur-xl flex flex-col justify-between px-8 py-24 border-b border-[#2c2722]">
          <div className="flex flex-col space-y-7">
            <span className="text-[10px] uppercase font-sans tracking-[0.35em] text-[#bba172]">
              ATELIER NAVIGATION
            </span>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl tracking-[0.18em] text-[#f4ecdf] hover:text-[#d4b584] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-8 border-t border-[#2c2722]/80 flex flex-col space-y-3">
            <p className="font-serif italic text-sm text-[#c2a37f]">
              "Soul in Stone. Handcrafted across the historic citadels of Rajasthan."
            </p>
            <p className="text-[10px] tracking-[0.2em] text-[#835c40] uppercase">
              JAIPUR · JODHPUR · UDAIPUR
            </p>
          </div>
        </div>
      )}
    </>
  );
}
