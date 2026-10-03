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

            {/* Social Icons (Instagram, Pinterest as requested) */}
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
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="hover:text-[#23201D] transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.33 1.366-.053.225-.177.271-.409.165-1.528-.711-2.483-2.946-2.483-4.743 0-3.864 2.809-7.413 8.096-7.413 4.251 0 7.556 3.03 7.556 7.08 0 4.224-2.663 7.623-6.36 7.623-1.242 0-2.41-.646-2.808-1.41l-.765 2.916c-.276 1.064-1.026 2.398-1.527 3.212C9.722 23.856 10.838 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
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
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-[0.2em] hover:text-[#23201D]"
              >
                Pinterest
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
