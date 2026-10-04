'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  onOpenContact?: () => void;
}

export default function Footer({ onOpenContact }: FooterProps) {
  return (
    <footer className="bg-[#FAF7F2] text-[#23201D] border-t border-[#E8E0D2] pt-20 pb-16">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 pb-16">
          {/* Left Column: RUH STONE Logo & Craft Tagline (Ventura inspired) */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Brand Wordmark (Ventura editorial style - no logo image) */}
              <Link href="/" className="inline-block group focus:outline-none" aria-label="RUH STONE">
                <span className="font-serif text-2xl tracking-[0.26em] text-[#23201D] font-light leading-none group-hover:text-[#AA9B87] transition-colors">
                  RUH STONE
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mt-2">
                  SOUL IN STONE · HANDCRAFTS
                </span>
              </Link>

              <p className="text-xs text-[#7A746C] font-light max-w-sm mt-5 leading-relaxed">
                Thoughtfully crafted objects shaped by tradition, material and human hands. Contemporary Indian craft, carved stone vessels, wheel-thrown ceramics, and quiet luxury decor.
              </p>
            </div>

            {/* Social Icons (Instagram) */}
            <div className="flex items-center space-x-5 text-[#7A746C]">
              <a
                href="https://instagram.com/ruhstonee"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram @ruhstonee"
                className="hover:text-[#23201D] transition-colors inline-flex items-center space-x-2 text-xs"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span className="font-sans text-[11px] tracking-wider font-medium">@ruhstonee</span>
              </a>

              <a
                href="mailto:support@ruhstone.com"
                aria-label="Email support@ruhstone.com"
                className="hover:text-[#23201D] transition-colors inline-flex items-center space-x-2 text-xs"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="font-sans text-[11px] tracking-wider font-medium">support@ruhstone.com</span>
              </a>
            </div>
          </div>

          {/* Right Column: Clean Link Columns */}
          <div className="md:col-span-6 grid grid-cols-2 gap-8 md:pl-16">
            <div className="flex flex-col space-y-3.5 text-xs font-sans tracking-[0.16em]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-semibold mb-1">
                COLLECTIONS
              </span>
              <a href="/#shop" className="text-[#23201D] hover:text-[#AA9B87] transition-colors">
                Shop
              </a>
              <a href="/#collections" className="text-[#23201D] hover:text-[#AA9B87] transition-colors">
                Collections
              </a>
              <a href="/#about" className="text-[#23201D] hover:text-[#AA9B87] transition-colors">
                About
              </a>
              <a href="/#faq" className="text-[#23201D] hover:text-[#AA9B87] transition-colors">
                FAQ
              </a>
            </div>

            <div className="flex flex-col space-y-3.5 text-xs font-sans tracking-[0.16em]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-semibold mb-1">
                CLIENT SERVICES
              </span>
              <button
                onClick={onOpenContact}
                className="text-left text-[#23201D] hover:text-[#AA9B87] transition-colors focus:outline-none cursor-pointer"
              >
                Contact
              </button>
              <a
                href="mailto:support@ruhstone.com"
                className="text-[#23201D] hover:text-[#AA9B87] transition-colors"
              >
                support@ruhstone.com
              </a>
              <a
                href="/#faq"
                className="text-[#23201D] hover:text-[#AA9B87] transition-colors"
              >
                Shipping & Transit
              </a>
              <a
                href="/#faq"
                className="text-[#23201D] hover:text-[#AA9B87] transition-colors"
              >
                Returns & Care
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-10 border-t border-[#E8E0D2] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A746C] tracking-wide">
          <span>© {new Date().getFullYear()} RUH STONE. All rights reserved.</span>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="text-[#7A746C]">Curated Indian Craftsmanship</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
