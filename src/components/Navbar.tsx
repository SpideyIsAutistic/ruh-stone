'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Menu, X, ChevronDown, Package, MapPin, Heart, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenContact: () => void;
  onOpenAuthModal?: () => void;
}

export default function Navbar({ cartCount, onOpenCart, onOpenContact }: NavbarProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string } | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check patron session
  const checkSession = async () => {
    try {
      const res = await fetch('/api/account/profile');
      if (res.ok) {
        const data = await res.json();
        setUserProfile({
          full_name: data.profile?.full_name || data.email?.split('@')[0],
          email: data.email,
        });
      } else {
        setUserProfile(null);
      }
    } catch {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUserProfile(null);
      setAccountDropdownOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  const navLinks = [
    { label: 'SHOP', href: '/#shop' },
    { label: 'COLLECTIONS', href: '/#collections' },
    { label: 'TRACK ORDER', href: '/track-order' },
    { label: 'ABOUT', href: '/#about' },
    { label: 'FAQ', href: '/#faq' },
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
          {/* Left: Brand Wordmark */}
          <Link
            href="/"
            className="group flex items-center shrink-0 focus:outline-none"
            aria-label="RUH STONE Home"
          >
            <span className="font-serif text-xl sm:text-2xl tracking-[0.28em] text-[#23201D] font-light leading-none group-hover:text-[#AA9B87] transition-colors">
              RUH STONE
            </span>
          </Link>

          {/* Right: Desktop Navigation + Account + Cart */}
          <div className="hidden lg:flex items-center space-x-8">
            <nav className="flex items-center space-x-7 text-[11px] font-sans tracking-[0.22em] font-medium text-[#23201D]">
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

            {/* Account Link or Popup Trigger */}
            <div className="relative" ref={dropdownRef}>
              {userProfile ? (
                <div>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center space-x-1.5 text-[11px] font-sans tracking-[0.2em] font-medium text-[#23201D] hover:text-[#AA9B87] transition-colors focus:outline-none cursor-pointer"
                    aria-label="Patron Account Menu"
                  >
                    <User className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span className="truncate max-w-[120px]">
                      {userProfile.full_name?.toUpperCase() || 'ACCOUNT'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#AA9B87]" />
                  </button>

                  {/* Dropdown Menu */}
                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#FAF7F2] border border-[#E8E0D2] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-[#E8E0D2]">
                        <span className="text-[9px] uppercase tracking-widest text-[#AA9B87] block">
                          SIGNED IN AS
                        </span>
                        <span className="text-xs font-serif text-[#23201D] truncate block mt-0.5">
                          {userProfile.full_name || userProfile.email}
                        </span>
                      </div>

                      <Link
                        href="/account"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-[#23201D] hover:bg-[#F4EFE6] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#AA9B87]" />
                        <span>Patron Dashboard</span>
                      </Link>

                      <Link
                        href="/account?tab=orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-[#23201D] hover:bg-[#F4EFE6] transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-[#AA9B87]" />
                        <span>My Consignments</span>
                      </Link>

                      <Link
                        href="/account?tab=addresses"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-[#23201D] hover:bg-[#F4EFE6] transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#AA9B87]" />
                        <span>Delivery Addresses</span>
                      </Link>

                      <Link
                        href="/account?tab=wishlist"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-[#23201D] hover:bg-[#F4EFE6] transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-[#AA9B87]" />
                        <span>Saved Wishlist</span>
                      </Link>

                      <div className="border-t border-[#E8E0D2] mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-[#8B3A2B] hover:bg-[#8B3A2B]/10 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-1.5 text-[11px] font-sans tracking-[0.2em] font-medium text-[#23201D] hover:text-[#AA9B87] transition-colors focus:outline-none cursor-pointer"
                  aria-label="Sign In or Open Patron Portal"
                >
                  <User className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>SIGN IN</span>
                </button>
              )}
            </div>

            {/* Cart Indicator */}
            <button
              onClick={onOpenCart}
              className="flex items-center space-x-2 text-[11px] font-sans tracking-[0.2em] font-medium text-[#23201D] hover:text-[#AA9B87] transition-colors focus:outline-none cursor-pointer"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.4]" />
              <span className="tabular-nums">CART ({cartCount})</span>
            </button>
          </div>

          {/* Mobile Right Action Bar */}
          <div className="flex lg:hidden items-center space-x-3">
            <button
              onClick={() => {
                if (userProfile) {
                  router.push('/account');
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="p-1.5 text-[#23201D] focus:outline-none"
              aria-label="Patron Portal"
            >
              <User className="w-4 h-4 stroke-[1.5]" />
            </button>

            <button
              onClick={onOpenCart}
              className="flex items-center space-x-1 text-[11px] font-sans tracking-widest text-[#23201D] p-1.5 cursor-pointer"
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

            {userProfile ? (
              <div className="pt-4 border-t border-[#E8E0D2] space-y-3">
                <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#AA9B87]">
                  PATRON: {userProfile.full_name?.toUpperCase() || userProfile.email}
                </span>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-serif text-2xl tracking-wide text-[#23201D] hover:text-[#AA9B87]"
                >
                  DASHBOARD & ORDERS
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="text-xs uppercase tracking-widest text-[#8B3A2B] pt-1"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="text-left font-serif text-3xl tracking-wide text-[#23201D] hover:text-[#AA9B87] transition-colors"
              >
                SIGN IN / REGISTER
              </button>
            )}
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

      {/* Luxury Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          checkSession();
          router.refresh();
        }}
      />
    </>
  );
}
