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
      className="fixed inset-0 m-auto z-50 w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#F9F6F0] text-[#241A14] border border-[#B98B62] p-0 shadow-[0_24px_80px_rgba(36,26,20,0.35)] backdrop:bg-[#241A14]/70 backdrop:backdrop-blur-sm rounded-sm focus:outline-none wasli-paper"
    >
      {/* Sticky Header with Close Button */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-5 bg-[#F2EBDD]/95 backdrop-blur-md border-b border-[#D8C5A5]">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rotate-45 bg-[#6E3027]" />
          <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#6E3027] font-semibold">
            {product.category} · {product.edition}
          </span>
        </div>

        <button
          onClick={onClose}
          data-cursor="pointer"
          aria-label="Close exhibition modal"
          className="p-2 text-[#8C613C] hover:text-[#241A14] hover:bg-[#E7DBCA] transition-colors rounded-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 md:px-12 py-8 md:py-12 space-y-14">
        {/* Title & Archival Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase font-sans tracking-[0.3em] text-[#6E3027] font-semibold">
            ORIGIN: {product.origin}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#241A14] tracking-[0.06em] font-light">
            {product.name}
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-[#9B5540]">
            {product.subtitle}
          </p>
          <p className="text-sm font-sans text-[#524035] leading-relaxed max-w-xl mx-auto pt-2">
            {product.shortDescription}
          </p>
        </div>

        {/* Hero Environmental View */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#D8C5A5] bg-[#E7DBCA]">
          <Image
            src={product.heroImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 90vw"
            className="object-cover object-center filter contrast-105"
          />
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-[#F2EBDD]/90 backdrop-blur-sm border border-[#D8C5A5] text-[10px] uppercase font-sans tracking-[0.2em] text-[#6E3027] font-semibold">
            PRIMARY MONOLITH VIEW · HAVELI GALLERY LIGHTING
          </div>
        </div>

        {/* Material & Craft Specifications Matrix */}
        <div className="p-6 md:p-8 bg-[#EDE4D3] border border-[#D8C5A5] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#8C613C] uppercase block font-semibold">
              MATERIAL
            </span>
            <p className="font-serif text-base text-[#241A14] mt-1 font-medium">{product.material}</p>
          </div>
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#8C613C] uppercase block font-semibold">
              DIMENSIONS
            </span>
            <p className="font-serif text-base text-[#241A14] mt-1 font-medium">{product.dimensions}</p>
          </div>
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#8C613C] uppercase block font-semibold">
              WEIGHT
            </span>
            <p className="font-serif text-base text-[#241A14] mt-1 font-medium">{product.weight}</p>
          </div>
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#8C613C] uppercase block font-semibold">
              CRAFT DISCIPLINE
            </span>
            <p className="font-serif text-base text-[#241A14] mt-1 font-medium">{product.craft}</p>
          </div>
        </div>

        {/* SECTION 1: THE MATERIAL */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          <div className="md:col-span-6 relative aspect-[4/3] w-full overflow-hidden border border-[#D8C5A5] bg-[#E7DBCA]">
            <Image
              src={product.theMaterial.imageUrl}
              alt={product.theMaterial.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center filter contrast-105"
            />
          </div>
          <div className="md:col-span-6 space-y-4 md:pl-6">
            <span className="text-[10px] font-sans tracking-[0.35em] text-[#6E3027] uppercase font-bold">
              {product.theMaterial.title}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#241A14] font-light">
              {product.theMaterial.subtitle}
            </h3>
            <p className="text-sm font-sans text-[#524035] font-light leading-relaxed">
              {product.theMaterial.description}
            </p>
            {product.theMaterial.macroCaption && (
              <p className="text-[11px] font-sans italic text-[#8C613C] pt-2 border-t border-[#D8C5A5]">
                Macro Focus: {product.theMaterial.macroCaption}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 2: THE HAND */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 md:order-2 relative aspect-[4/3] w-full overflow-hidden border border-[#D8C5A5] bg-[#E7DBCA]">
            <Image
              src={product.theHand.imageUrl}
              alt={product.theHand.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center filter contrast-105"
            />
          </div>
          <div className="md:col-span-6 md:order-1 space-y-4 md:pr-6">
            <span className="text-[10px] font-sans tracking-[0.35em] text-[#6E3027] uppercase font-bold">
              {product.theHand.title}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#241A14] font-light">
              {product.theHand.subtitle}
            </h3>
            <p className="text-sm font-sans text-[#524035] font-light leading-relaxed">
              {product.theHand.description}
            </p>
            {product.theHand.macroCaption && (
              <p className="text-[11px] font-sans italic text-[#8C613C] pt-2 border-t border-[#D8C5A5]">
                Guild Lineage: {product.theHand.macroCaption}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 3: THE DETAIL */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 relative aspect-[4/3] w-full overflow-hidden border border-[#D8C5A5] bg-[#E7DBCA]">
            <Image
              src={product.theDetail.imageUrl}
              alt={product.theDetail.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center filter contrast-105"
            />
          </div>
          <div className="md:col-span-6 space-y-4 md:pl-6">
            <span className="text-[10px] font-sans tracking-[0.35em] text-[#6E3027] uppercase font-bold">
              {product.theDetail.title}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#241A14] font-light">
              {product.theDetail.subtitle}
            </h3>
            <p className="text-sm font-sans text-[#524035] font-light leading-relaxed">
              {product.theDetail.description}
            </p>
            {product.theDetail.macroCaption && (
              <p className="text-[11px] font-sans italic text-[#8C613C] pt-2 border-t border-[#D8C5A5]">
                Architectural Relief: {product.theDetail.macroCaption}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 4: THE STORY */}
        <div className="p-8 md:p-12 bg-[#EDE4D3] border border-[#D8C5A5] space-y-5">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-4 h-4 text-[#6E3027]" />
            <span className="text-[10px] font-sans tracking-[0.35em] text-[#6E3027] uppercase font-bold">
              {product.theStory.title} · {product.theStory.subtitle}
            </span>
          </div>
          <p className="font-serif text-xl sm:text-2xl text-[#241A14] font-light leading-relaxed">
            {product.theStory.description}
          </p>
          <div className="pt-4 border-t border-[#D8C5A5] flex flex-wrap gap-6 text-xs text-[#8C613C] tracking-[0.15em] uppercase font-semibold">
            <span>CERTIFICATE: {product.provenance.certificateNumber}</span>
            <span>·</span>
            <span>QUARRY: {product.provenance.quarryLocation}</span>
            <span>·</span>
            <span>YEAR: {product.provenance.yearCrafted}</span>
          </div>
        </div>

        {/* Conservation & Care Instructions */}
        <div className="p-6 bg-[#F2EBDD] border border-[#D8C5A5] space-y-3">
          <span className="text-[10px] font-sans tracking-[0.25em] text-[#6E3027] uppercase font-bold block">
            CONSERVATION & ARCHIVAL CARE
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#524035] font-light">
            {product.conservationCare.map((care, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-[#6E3027] mt-0.5 font-bold">•</span>
                <span>{care}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Acquisition Action Bar */}
        <div className="pt-6 border-t border-[#D8C5A5] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#8C613C] block font-semibold">
              ACQUISITION VALUATION
            </span>
            <p className="font-serif text-3xl text-[#241A14] tracking-wider font-medium mt-0.5">
              {product.priceFormatted}
            </p>
            <p className="text-[11px] text-[#524035] mt-0.5">
              Includes bespoke foam-lined timber crate & provenance dossier
            </p>
          </div>

          <button
            onClick={() => onAddToCollection(product)}
            data-cursor="pointer"
            className={`w-full sm:w-auto px-8 py-4 text-xs font-sans tracking-[0.3em] uppercase font-semibold transition-all duration-300 flex items-center justify-center space-x-3 ${
              isAlreadyInCollection
                ? 'bg-[#EDE4D3] text-[#6E3027] border border-[#6E3027]'
                : 'bg-[#241A14] text-[#F2EBDD] hover:bg-[#6E3027] shadow-[0_4px_16px_rgba(36,26,20,0.2)]'
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

        {/* Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-[#8C613C] font-medium">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#6E3027]" />
            <span>Authenticated by hereditary Guild Sthapatis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#6E3027]" />
            <span>White-glove architectural crate placement worldwide</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}
