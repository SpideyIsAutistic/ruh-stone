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
    <footer className="relative bg-[#241A14] text-[#F2EBDD] border-t border-[#4F1F19] overflow-hidden">
      {/* Subtle Terracotta/Red Radial Glow */}
      <div className="absolute inset-0 bg-radial from-[#6E3027]/25 via-transparent to-transparent pointer-events-none" />

      {/* Rajasthani Architectural Carved Cornice Border */}
      <div className="relative w-full h-3 border-b border-[#382A22] bg-[#1A120D] flex items-center justify-center overflow-hidden">
        <div className="w-full flex space-x-4 opacity-50">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rotate-45 border border-[#B98B62]" />
              <span className="w-4 h-[1px] bg-[#B98B62]" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16">
        {/* Brand Plaque Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] uppercase font-sans tracking-[0.4em] text-[#D8C5A5] font-semibold">
            ESTABLISHED IN THE KINGDOM OF MARWAR
          </span>
          <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-[0.14em] text-[#F2EBDD] font-light">
            RUH STONE
          </h2>
          <p className="font-serif italic text-2xl sm:text-3xl text-[#D8C5A5]">
            Soul in Stone.
          </p>
        </div>

        {/* Newsletter Subscription Strip */}
        <div className="max-w-2xl mx-auto mb-20 p-8 bg-[#2D211A] border border-[#4F1F19] rounded-sm">
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#D8C5A5] block mb-1 font-semibold">
              THE ARCHIVAL GAZETTE
            </span>
            <p className="font-serif italic text-base text-[#E7DBCA]">
              Private monograph releases, private salon invitations, and newly cataloged stone acquisitions.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center justify-center space-x-2 py-3 text-xs font-sans tracking-[0.2em] uppercase text-[#D8C5A5]">
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
                className="flex-1 px-4 py-3 bg-[#1A120D] border border-[#4F1F19] text-xs text-[#F2EBDD] placeholder-[#8C613C] focus:border-[#D8C5A5] focus:outline-none"
              />
              <button
                type="submit"
                data-cursor="pointer"
                className="px-6 py-3 bg-[#6E3027] hover:bg-[#9B5540] text-[#F2EBDD] font-sans text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>INVITE ME</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-[#382A22]">
          {/* Col 1: Heritage Ateliers */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#D8C5A5] font-semibold block">
              HERITAGE ATELIERS
            </span>
            <div className="space-y-3 text-xs font-sans text-[#E7DBCA] font-light leading-relaxed">
              <div>
                <strong className="text-[#F2EBDD] block text-xs tracking-wider">JAIPUR PRIVATE SALON</strong>
                <p>Haveli Kothi Anand, C-Scheme</p>
                <p>Jaipur, Rajasthan 302001</p>
                <p className="text-[#B98B62] mt-0.5">By private curatorial appointment</p>
              </div>
              <div className="pt-2">
                <strong className="text-[#F2EBDD] block text-xs tracking-wider">JODHPUR QUARRY WORKSHOPS</strong>
                <p>Mandore Heritage Silawat Quarter</p>
                <p>Jodhpur, Marwar 342007</p>
              </div>
            </div>
          </div>

          {/* Col 2: The Archive */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#D8C5A5] font-semibold block">
              THE COLLECTION
            </span>
            <ul className="space-y-2 text-xs font-sans tracking-[0.15em] uppercase text-[#B98B62]">
              <li>
                <a href="#collection" className="hover:text-[#F2EBDD] transition-colors">
                  Monolithic Stone Urns
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-[#F2EBDD] transition-colors">
                  German Silver Repoussé
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-[#F2EBDD] transition-colors">
                  Haveli Jharokha Bas-Reliefs
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-[#F2EBDD] transition-colors">
                  Makrana Marble Sculptural Basins
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-[#F2EBDD] transition-colors">
                  Archival Temple Capitals
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Monograph & Journal */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#D8C5A5] font-semibold block">
              PUBLICATIONS & ESSAYS
            </span>
            <ul className="space-y-2 text-xs font-sans tracking-[0.15em] uppercase text-[#B98B62]">
              <li>
                <a href="#journal" className="hover:text-[#F2EBDD] transition-colors">
                  The Art of Stone Carving
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-[#F2EBDD] transition-colors">
                  The Craftsmen of Rajasthan
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-[#F2EBDD] transition-colors">
                  Why Handmade Objects Matter
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-[#F2EBDD] transition-colors">
                  From Desert to Object
                </a>
              </li>
              <li>
                <a href="#craft" className="hover:text-[#F2EBDD] transition-colors">
                  The Shilpa Shastra Canons
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Curatorial Contact & Social */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#D8C5A5] font-semibold block">
              CURATORIAL INQUIRIES
            </span>
            <div className="space-y-3 text-xs font-sans text-[#E7DBCA] font-light">
              <p>
                Private commissions for architectural installations, estates, and museum collections:
              </p>
              <p className="font-serif text-base text-[#D8C5A5]">
                curator@ruhstone.com
              </p>
              <p className="text-xs text-[#F2EBDD]">
                +91 (0) 141 238 9012
              </p>
              <div className="pt-2 flex items-center space-x-4 text-xs font-sans uppercase tracking-[0.2em] text-[#D8C5A5]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F2EBDD] transition-colors"
                >
                  INSTAGRAM
                </a>
                <span>·</span>
                <a
                  href="#story"
                  className="hover:text-[#F2EBDD] transition-colors"
                >
                  ARCHIVE REGISTRY
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans text-[#8C613C] tracking-[0.18em] uppercase gap-4 font-medium">
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
