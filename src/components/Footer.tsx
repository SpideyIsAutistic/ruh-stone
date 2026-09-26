'use client';

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="relative bg-[#080706] text-[#f4ecdf] border-t border-[#2c2722] overflow-hidden">
      {/* Subtle Deep Maroon & Sandstone Radial Wash */}
      <div className="absolute inset-0 bg-radial from-[#250f12]/35 via-transparent to-[#080706] pointer-events-none" />
      <div className="absolute inset-0 sandstone-texture opacity-30 pointer-events-none" />

      {/* Rajasthani Architectural Carved Cornice Border */}
      <div className="relative w-full h-3 border-b border-[#332d26] bg-[#141311] flex items-center justify-center overflow-hidden">
        <div className="w-full flex space-x-4 opacity-40">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rotate-45 border border-[#bba172]" />
              <span className="w-4 h-[1px] bg-[#bba172]" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16">
        {/* Massive Brand Statement Header */}
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] uppercase font-sans tracking-[0.45em] text-[#bba172] font-semibold">
            ESTABLISHED IN THE KINGDOM OF MARWAR
          </span>
          <h2 className="font-serif text-6xl sm:text-8xl md:text-9xl tracking-[0.16em] text-[#faf6f0] font-light">
            RUH STONE
          </h2>
          <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#d4b584]">
            Soul in Stone.
          </p>
        </div>

        {/* Newsletter Subscription Strip */}
        <div className="max-w-2xl mx-auto mb-20 p-8 bg-[#141311]/80 border border-[#332d26] rounded-sm backdrop-blur-sm">
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#d4b584] block mb-1">
              THE ARCHIVAL GAZETTE
            </span>
            <p className="font-serif italic text-base text-[#e7dac5]">
              Private monograph releases, private salon invitations, and newly cataloged stone acquisitions.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center justify-center space-x-2 py-3 text-xs font-sans tracking-[0.2em] uppercase text-[#d4b584]">
              <Check className="w-4 h-4" />
              <span>You have been registered into the private archive.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter collector email address"
                className="flex-1 px-4 py-3 bg-[#0c0b0a] border border-[#2c2722] text-xs text-[#faf6f0] placeholder-[#684833] focus:border-[#d4b584] focus:outline-none"
              />
              <button
                type="submit"
                data-cursor="pointer"
                className="px-6 py-3 bg-[#d4b584] hover:bg-[#faf6f0] text-[#0e0d0c] font-sans text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_4px_16px_rgba(212,181,132,0.2)]"
              >
                <span>INVITE ME</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-[#2c2722]">
          {/* Col 1: Heritage Ateliers */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#d4b584] font-semibold block">
              HERITAGE ATELIERS
            </span>
            <div className="space-y-3 text-xs font-sans text-[#c2a37f] font-light leading-relaxed">
              <div>
                <strong className="text-[#faf6f0] block text-xs tracking-wider">JAIPUR PRIVATE SALON</strong>
                <p>Haveli Kothi Anand, C-Scheme</p>
                <p>Jaipur, Rajasthan 302001</p>
                <p className="text-[#835c40] mt-1">Viewing by private appointment</p>
              </div>
              <div className="pt-2">
                <strong className="text-[#faf6f0] block text-xs tracking-wider">JODHPUR WORKSHOPS</strong>
                <p>Mandore Heritage Silawat Quarter</p>
                <p>Jodhpur, Marwar 342007</p>
              </div>
            </div>
          </div>

          {/* Col 2: Permanent Collection */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#d4b584] font-semibold block">
              THE ARCHIVE
            </span>
            <ul className="space-y-2 text-xs font-sans tracking-[0.15em] uppercase text-[#a78056]">
              <li>
                <a href="#collection" className="hover:text-[#faf6f0] transition-colors">
                  Monolithic Stone Urns
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-[#faf6f0] transition-colors">
                  German Silver Repoussé
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-[#faf6f0] transition-colors">
                  Haveli Jharokha Bas-Reliefs
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-[#faf6f0] transition-colors">
                  Makrana Marble Sculptural Basins
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-[#faf6f0] transition-colors">
                  Archival Temple Capitals
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Monograph & Journal */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#d4b584] font-semibold block">
              PUBLICATIONS & ESSAYS
            </span>
            <ul className="space-y-2 text-xs font-sans tracking-[0.15em] uppercase text-[#a78056]">
              <li>
                <a href="#journal" className="hover:text-[#faf6f0] transition-colors">
                  The Art of Stone Carving
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-[#faf6f0] transition-colors">
                  The Craftsmen of Rajasthan
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-[#faf6f0] transition-colors">
                  Why Handmade Objects Matter
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-[#faf6f0] transition-colors">
                  From Desert to Object
                </a>
              </li>
              <li>
                <a href="#craft" className="hover:text-[#faf6f0] transition-colors">
                  The Shilpa Shastra Canons
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Private Salon Inquiry & Social */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#d4b584] font-semibold block">
              CURATORIAL INQUIRIES
            </span>
            <div className="space-y-3 text-xs font-sans text-[#c2a37f] font-light">
              <p>
                Private commissions for architectural installations, estates, and museum collections:
              </p>
              <p className="font-serif text-base text-[#d4b584]">
                curator@ruhstone.com
              </p>
              <p className="text-xs text-[#faf6f0]">
                +91 (0) 141 238 9012
              </p>
              <div className="pt-2 flex items-center space-x-4 text-xs font-sans uppercase tracking-[0.2em] text-[#bba172]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#faf6f0] transition-colors"
                >
                  INSTAGRAM
                </a>
                <span>·</span>
                <a
                  href="#story"
                  className="hover:text-[#faf6f0] transition-colors"
                >
                  ARCHIVE REGISTRY
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans text-[#835c40] tracking-[0.18em] uppercase gap-4">
          <p>© {new Date().getFullYear()} RUH STONE. ALL ARCHIVAL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-6 text-[10px]">
            <span>AUTHENTICITY GUARANTEED</span>
            <span>·</span>
            <span>WHITE-GLOVE WORLDWIDE CRATING</span>
            <span>·</span>
            <span>RAJASTHAN, INDIA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
