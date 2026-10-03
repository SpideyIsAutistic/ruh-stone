'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenContact: () => void;
}

export default function Navbar({ cartCount, onOpenCart, onOpenContact }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'SHOP', href: '#shop' },
    { label: 'COLLECTIONS', href: '#collections' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact', onClick: onOpenContact },
  ];

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 w-full bg-[#FAF7F2] border-b border-[#E8E0D2] transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_4px_20px_rgba(35,32,29,0.05)]' : 'shadow-none'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 md:py-6 flex items-center justify-between gap-6">
          {/* Left: Brand Wordmark (Ventura minimalist typography - no logo image) */}
          <Link
            href="/"
            className="group flex items-center shrink-0 focus:outline-none"
            aria-label="RUH STONE Home"
          >
            <span className="font-serif text-xl sm:text-2xl tracking-[0.28em] text-[#23201D] font-light leading-none group-hover:text-[#AA9B87] transition-colors">
              RUH STONE
            </span>
          </Link>

          {/* Right: Desktop Navigation + Social + Cart (Ventura benchmark layout) */}
          <div className="hidden lg:flex items-center space-x-9">
            <nav className="flex items-center space-x-8 text-[11px] font-sans tracking-[0.22em] font-medium text-[#23201D]">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (link.onClick) {
                      e.preventDefault();
                      link.onClick();
                    }
                  }}
                  className="link-underline py-1 text-[#23201D]/85 hover:text-[#23201D] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Subtle Divider */}
            <div className="h-4 w-[1px] bg-[#D1C2AC]/70" />

            {/* Social Icons (Instagram) */}
            <div className="flex items-center space-x-4 text-[#7A746C]">
              <a
                href="https://instagram.com/ruhstonee"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram @ruhstonee"
                className="hover:text-[#23201D] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>

            {/* Cart Indicator (Ventura clean style) */}
            <button
              onClick={onOpenCart}
              className="flex items-center space-x-2 text-[11px] font-sans tracking-[0.2em] font-medium text-[#23201D] hover:text-[#AA9B87] transition-colors focus:outline-none"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.4]" />
              <span className="tabular-nums">CART ({cartCount})</span>
            </button>
          </div>

          {/* Mobile Right Action Bar */}
          <div className="flex lg:hidden items-center space-x-4">
            <button
              onClick={onOpenCart}
              className="flex items-center space-x-1.5 text-[11px] font-sans tracking-widest text-[#23201D] p-1.5"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span className="tabular-nums font-medium text-xs">({cartCount})</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#23201D] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-[#FAF7F2] flex flex-col justify-between px-8 pt-36 pb-12 border-b border-[#E8E0D2] animate-in fade-in duration-200">
          <div className="flex flex-col space-y-7">
            <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#7A746C]">
              ATELIER NAVIGATION
            </span>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className="font-serif text-3xl tracking-wide text-[#23201D] hover:text-[#AA9B87] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-8 border-t border-[#E8E0D2] flex flex-col space-y-4">
            <div className="flex items-center space-x-6 text-[#7A746C]">
              <a
                href="https://instagram.com/ruhstonee"
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-[0.2em] hover:text-[#23201D]"
              >
                Instagram (@ruhstonee)
              </a>
            </div>
            <p className="text-[11px] text-[#7A746C] tracking-wide">
              RUH STONE — The beauty of the handmade. Contemporary Indian craft & artisan decor.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
