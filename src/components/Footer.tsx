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

            {/* Social Icons (Instagram, Pinterest as requested) */}
            <div className="flex items-center space-x-5 text-[#7A746C]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-[#23201D] transition-colors"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="hover:text-[#23201D] transition-colors"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.33 1.366-.053.225-.177.271-.409.165-1.528-.711-2.483-2.946-2.483-4.743 0-3.864 2.809-7.413 8.096-7.413 4.251 0 7.556 3.03 7.556 7.08 0 4.224-2.663 7.623-6.36 7.623-1.242 0-2.41-.646-2.808-1.41l-.765 2.916c-.276 1.064-1.026 2.398-1.527 3.212C9.722 23.856 10.838 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Clean Link Columns (Exact User Spec) */}
          <div className="md:col-span-6 grid grid-cols-2 gap-8 md:pl-16">
            <div className="flex flex-col space-y-3.5 text-xs font-sans tracking-[0.16em]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-semibold mb-1">
                COLLECTIONS
              </span>
              <a href="#shop" className="text-[#23201D] hover:text-[#AA9B87] transition-colors">
                Shop
              </a>
              <a href="#collections" className="text-[#23201D] hover:text-[#AA9B87] transition-colors">
                Collections
              </a>
              <a href="#about" className="text-[#23201D] hover:text-[#AA9B87] transition-colors">
                About
              </a>
            </div>

            <div className="flex flex-col space-y-3.5 text-xs font-sans tracking-[0.16em]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-semibold mb-1">
                CLIENT SERVICES
              </span>
              <button
                onClick={onOpenContact}
                className="text-left text-[#23201D] hover:text-[#AA9B87] transition-colors focus:outline-none"
              >
                Contact
              </button>
              <a
                href="#shipping"
                onClick={(e) => {
                  e.preventDefault();
                  alert("RUH STONE offers complimentary insured white-glove shipping on all handmade orders across India, with international express dispatch to 45 countries.");
                }}
                className="text-[#23201D] hover:text-[#AA9B87] transition-colors"
              >
                Shipping
              </a>
              <a
                href="#returns"
                onClick={(e) => {
                  e.preventDefault();
                  alert("We accept complimentary returns within 14 days of delivery for all non-custom handmade objects in their original packaging.");
                }}
                className="text-[#23201D] hover:text-[#AA9B87] transition-colors"
              >
                Returns
              </a>
              <a href="#privacy" className="text-[#23201D] hover:text-[#AA9B87] transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-10 border-t border-[#E8E0D2] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A746C] tracking-wide">
          <span>© {new Date().getFullYear()} RUH STONE. All rights reserved.</span>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="text-[#7A746C]">Curated Indian Craftsmanship</span>
            <span>·</span>
            <Link href="/admin" className="text-[10px] text-[#7A746C]/70 hover:text-[#23201D] tracking-widest uppercase">
              Atelier Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
