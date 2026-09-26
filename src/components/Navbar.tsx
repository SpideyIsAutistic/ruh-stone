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
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAmbientSound = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      setAudioCtx(ctx);
      playHarmonicChime(ctx, 432);
      setIsAudioActive(true);
    } else {
      if (isAudioActive) {
        audioCtx.suspend();
        setIsAudioActive(false);
      } else {
        audioCtx.resume();
        playHarmonicChime(audioCtx, 528);
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
      gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    } catch {
      // Audio might be restricted
    }
  };

  const navItems = [
    { label: 'THE COLLECTION', href: '#collection' },
    { label: 'THE HAND', href: '#craft' },
    { label: 'HAVELI ARCHIVE', href: '#story' },
    { label: 'RAJASTHAN MAP', href: '#rajasthan' },
    { label: 'MONOGRAPHS', href: '#journal' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-[#F2EBDD]/95 backdrop-blur-md border-b border-[#D8C5A5] shadow-[0_6px_20px_rgba(36,26,20,0.06)] py-4'
            : 'bg-gradient-to-b from-[#F2EBDD]/90 via-[#F2EBDD]/40 to-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Plaque */}
          <Link
            href="#"
            className="group flex flex-col items-start focus:outline-none"
            data-cursor="pointer"
          >
            <span className="font-serif text-xl md:text-2xl tracking-[0.2em] text-[#241A14] font-light group-hover:text-[#6E3027] transition-colors duration-300">
              RUH STONE
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#9B5540] font-medium -mt-0.5">
              SOUL IN STONE
            </span>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-10 text-[11px] font-sans tracking-[0.25em] font-medium text-[#524035]">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                data-cursor="pointer"
                className="relative py-1 text-[#382A22] hover:text-[#6E3027] transition-colors duration-300 tracking-[0.25em] uppercase group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#9B5540] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Ambient Haveli Chime Toggle */}
            <button
              onClick={toggleAmbientSound}
              aria-label={isAudioActive ? 'Mute ambient chime' : 'Enable ambient chime'}
              data-cursor="pointer"
              className="p-2 text-[#8C613C] hover:text-[#6E3027] transition-colors duration-300 focus:outline-none flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase"
              title={isAudioActive ? 'Resonance active' : 'Experience ambient resonance'}
            >
              {isAudioActive ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#6E3027]" />
                  <span className="hidden sm:inline-block text-[9px] text-[#6E3027] font-medium">RESONANCE ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#8C613C]" />
                  <span className="hidden sm:inline-block text-[9px] text-[#8C613C]">CHIME</span>
                </>
              )}
            </button>

            {/* Collection Inquiry Trigger */}
            <button
              onClick={onOpenAcquisitionDrawer}
              data-cursor="pointer"
              aria-label="View curated acquisition inquiry"
              className="relative p-2 text-[#241A14] hover:text-[#6E3027] transition-colors duration-300 focus:outline-none flex items-center space-x-2 border border-[#B98B62] bg-[#E7DBCA]/60 hover:bg-[#E7DBCA] px-3.5 py-1.5 rounded-sm"
            >
              <ShoppingBag className="w-4 h-4 text-[#9B5540]" />
              <span className="hidden sm:inline-block text-[10px] font-sans tracking-[0.25em] text-[#241A14] uppercase font-medium">
                INQUIRY
              </span>
              {acquisitionCount > 0 && (
                <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-[#6E3027] text-[#F2EBDD] text-[10px] font-bold flex items-center justify-center -top-1.5 -right-1.5">
                  {acquisitionCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-cursor="pointer"
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-[#241A14] hover:text-[#6E3027] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden bg-[#F2EBDD]/98 backdrop-blur-xl flex flex-col justify-between px-8 py-24 border-b border-[#D8C5A5]">
          <div className="flex flex-col space-y-7">
            <span className="text-[10px] uppercase font-sans tracking-[0.35em] text-[#9B5540] font-semibold">
              ATELIER DIRECTORY
            </span>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl tracking-[0.14em] text-[#241A14] hover:text-[#6E3027] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-8 border-t border-[#D8C5A5] flex flex-col space-y-3">
            <p className="font-serif italic text-sm text-[#524035]">
              "Soul in Stone. Handcrafted across the historic citadels of Rajasthan."
            </p>
            <p className="text-[10px] tracking-[0.2em] text-[#8C613C] uppercase">
              JAIPUR · JODHPUR · UDAIPUR
            </p>
          </div>
        </div>
      )}
    </>
  );
}
