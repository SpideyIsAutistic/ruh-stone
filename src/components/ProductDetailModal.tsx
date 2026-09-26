'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { CraftObject } from '@/types';
import { X, Check, ShieldCheck, Truck, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: CraftObject | null;
  onClose: () => void;
  onAddToCollection: (product: CraftObject) => void;
  isAlreadyInCollection: boolean;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCollection,
  isAlreadyInCollection,
}: ProductDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (product) {
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  // Modern Web Guidance fallback for light-dismiss on browsers without closedby
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInside) {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={onClose}
      className="fixed inset-0 m-auto z-50 w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#0c0b0a] text-[#f4ecdf] border border-[#332d26] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop:bg-[#060504]/90 backdrop:backdrop-blur-md rounded-sm focus:outline-none"
    >
      {/* Sticky Header with Close Button */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0e0d0c]/95 backdrop-blur-md border-b border-[#2c2722]">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rotate-45 bg-[#d4b584]" />
          <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#a17652]">
            {product.category} · {product.edition}
          </span>
        </div>

        <button
          onClick={onClose}
          data-cursor="pointer"
          aria-label="Close exhibition modal"
          className="p-2 text-[#c2a37f] hover:text-[#faf6f0] hover:bg-[#1a1815] transition-colors rounded-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 md:px-12 py-8 md:py-12 space-y-16">
        {/* Title & Archival Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase font-sans tracking-[0.3em] text-[#d4b584] font-medium">
            ORIGIN: {product.origin}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#faf6f0] tracking-[0.06em] font-light">
            {product.name}
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-[#c2a37f]">
            {product.subtitle}
          </p>
          <p className="text-sm font-sans text-[#a78056] leading-relaxed max-w-xl mx-auto pt-2">
            {product.shortDescription}
          </p>
        </div>

        {/* Hero Environmental View */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#332d26] bg-[#141311]">
          <Image
            src={product.heroImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 90vw"
            className="object-cover object-center filter brightness-90 contrast-105"
          />
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-[#0c0b0a]/80 backdrop-blur-sm border border-[#2c2722] text-[10px] uppercase font-sans tracking-[0.2em] text-[#d4b584]">
            PRIMARY MONOLITH VIEW · EXHIBITION LIGHTING
          </div>
        </div>

        {/* Material & Craft Specifications Matrix */}
        <div className="p-6 md:p-8 bg-[#141311] border border-[#2c2722] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#835c40] uppercase block">
              MATERIAL
            </span>
            <p className="font-serif text-base text-[#faf6f0] mt-1">{product.material}</p>
          </div>
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#835c40] uppercase block">
              DIMENSIONS
            </span>
            <p className="font-serif text-base text-[#faf6f0] mt-1">{product.dimensions}</p>
          </div>
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#835c40] uppercase block">
              WEIGHT
            </span>
            <p className="font-serif text-base text-[#faf6f0] mt-1">{product.weight}</p>
          </div>
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#835c40] uppercase block">
              CRAFT DISCIPLINE
            </span>
            <p className="font-serif text-base text-[#faf6f0] mt-1">{product.craft}</p>
          </div>
        </div>

        {/* SECTION 1: THE MATERIAL */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4">
          <div className="md:col-span-6 relative aspect-[4/3] w-full overflow-hidden border border-[#332d26] bg-[#141311]">
            <Image
              src={product.theMaterial.imageUrl}
              alt={product.theMaterial.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center filter brightness-95"
            />
          </div>
          <div className="md:col-span-6 space-y-4 md:pl-6">
            <span className="text-[10px] font-sans tracking-[0.35em] text-[#d4b584] uppercase font-semibold">
              {product.theMaterial.title}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#faf6f0] font-light">
              {product.theMaterial.subtitle}
            </h3>
            <p className="text-sm font-sans text-[#c2a37f] font-light leading-relaxed">
              {product.theMaterial.description}
            </p>
            {product.theMaterial.macroCaption && (
              <p className="text-[11px] font-sans italic text-[#a17652] pt-2 border-t border-[#26221d]">
                Macro Focus: {product.theMaterial.macroCaption}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 2: THE HAND */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 md:order-2 relative aspect-[4/3] w-full overflow-hidden border border-[#332d26] bg-[#141311]">
            <Image
              src={product.theHand.imageUrl}
              alt={product.theHand.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center filter brightness-95"
            />
          </div>
          <div className="md:col-span-6 md:order-1 space-y-4 md:pr-6">
            <span className="text-[10px] font-sans tracking-[0.35em] text-[#d4b584] uppercase font-semibold">
              {product.theHand.title}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#faf6f0] font-light">
              {product.theHand.subtitle}
            </h3>
            <p className="text-sm font-sans text-[#c2a37f] font-light leading-relaxed">
              {product.theHand.description}
            </p>
            {product.theHand.macroCaption && (
              <p className="text-[11px] font-sans italic text-[#a17652] pt-2 border-t border-[#26221d]">
                Guild Lineage: {product.theHand.macroCaption}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 3: THE DETAIL */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 relative aspect-[4/3] w-full overflow-hidden border border-[#332d26] bg-[#141311]">
            <Image
              src={product.theDetail.imageUrl}
              alt={product.theDetail.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center filter brightness-95"
            />
          </div>
          <div className="md:col-span-6 space-y-4 md:pl-6">
            <span className="text-[10px] font-sans tracking-[0.35em] text-[#d4b584] uppercase font-semibold">
              {product.theDetail.title}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#faf6f0] font-light">
              {product.theDetail.subtitle}
            </h3>
            <p className="text-sm font-sans text-[#c2a37f] font-light leading-relaxed">
              {product.theDetail.description}
            </p>
            {product.theDetail.macroCaption && (
              <p className="text-[11px] font-sans italic text-[#a17652] pt-2 border-t border-[#26221d]">
                Architectural Relief: {product.theDetail.macroCaption}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 4: THE STORY */}
        <div className="p-8 md:p-12 bg-[#141311] border border-[#2c2722] space-y-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-4 h-4 text-[#d4b584]" />
            <span className="text-[10px] font-sans tracking-[0.35em] text-[#d4b584] uppercase font-semibold">
              {product.theStory.title} · {product.theStory.subtitle}
            </span>
          </div>
          <p className="font-serif text-xl sm:text-2xl text-[#faf6f0] font-light leading-relaxed">
            {product.theStory.description}
          </p>
          <div className="pt-4 border-t border-[#26221d] flex flex-wrap gap-6 text-xs text-[#a17652] tracking-[0.15em] uppercase">
            <span>CERTIFICATE: {product.provenance.certificateNumber}</span>
            <span>·</span>
            <span>QUARRY: {product.provenance.quarryLocation}</span>
            <span>·</span>
            <span>YEAR: {product.provenance.yearCrafted}</span>
          </div>
        </div>

        {/* Conservation & Care Instructions */}
        <div className="p-6 bg-[#0e0d0c] border border-[#2c2722] space-y-3">
          <span className="text-[10px] font-sans tracking-[0.25em] text-[#d4b584] uppercase font-semibold block">
            CONSERVATION & ARCHIVAL CARE
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#c2a37f] font-light">
            {product.conservationCare.map((care, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-[#bba172] mt-0.5">•</span>
                <span>{care}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Acquisition Action Bar per Prompt */}
        <div className="pt-6 border-t border-[#2c2722] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#835c40] block">
              ACQUISITION VALUATION
            </span>
            <p className="font-serif text-3xl text-[#faf6f0] tracking-wider font-light mt-0.5">
              {product.priceFormatted}
            </p>
            <p className="text-[11px] text-[#a17652] mt-0.5">
              Includes bespoke foam-lined timber crate & provenance dossier
            </p>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <button
              onClick={() => onAddToCollection(product)}
              data-cursor="pointer"
              className={`w-full sm:w-auto px-8 py-4 text-xs font-sans tracking-[0.3em] uppercase font-semibold transition-all duration-300 flex items-center justify-center space-x-3 ${
                isAlreadyInCollection
                  ? 'bg-[#250f12] text-[#d4b584] border border-[#8f4832]'
                  : 'bg-[#d4b584] text-[#0e0d0c] hover:bg-[#faf6f0] shadow-[0_8px_24px_rgba(212,181,132,0.3)]'
              }`}
            >
              {isAlreadyInCollection ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>IN YOUR CURATED INQUIRY</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ADD TO COLLECTION</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* White-Glove Reassurance Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-[#835c40]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#bba172]" />
            <span>Authenticated by hereditary Guild Sthapatis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#bba172]" />
            <span>White-glove architectural crate placement worldwide</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}
