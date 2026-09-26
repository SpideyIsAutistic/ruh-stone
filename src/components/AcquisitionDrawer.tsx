'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AcquisitionItem } from '@/types';
import { X, Trash2, Shield, Truck, Send, CheckCircle2, Building2 } from 'lucide-react';

interface AcquisitionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: AcquisitionItem[];
  onRemoveItem: (id: string) => void;
  onClearItems: () => void;
}

export default function AcquisitionDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearItems,
}: AcquisitionDrawerProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    inquiryType: 'Private Architectural Placement',
    message: '',
  });

  if (!isOpen) return null;

  const totalValue = items.reduce(
    (sum, item) => sum + item.product.priceNumeric * item.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#241A14]/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-Out Drawer */}
      <div className="relative w-full max-w-xl h-full bg-[#F2EBDD] text-[#241A14] border-l border-[#B98B62] shadow-[0_0_60px_rgba(36,26,20,0.35)] flex flex-col justify-between overflow-y-auto z-10 wasli-paper">
        {/* Drawer Header */}
        <div className="p-6 md:p-8 border-b border-[#D8C5A5] flex items-center justify-between bg-[#FAF6F0]">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase font-sans tracking-[0.3em] text-[#6E3027] font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>RUH PRIVATE SALON</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-[#241A14] tracking-[0.06em] font-light mt-1">
              CURATED INQUIRY DOSSIER
            </h3>
          </div>

          <button
            onClick={onClose}
            data-cursor="pointer"
            aria-label="Close inquiry drawer"
            className="p-2 text-[#8C613C] hover:text-[#241A14] hover:bg-[#E7DBCA] transition-colors rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 md:p-8 flex-1 space-y-8 overflow-y-auto">
          {formSubmitted ? (
            <div className="py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#E7DBCA] border border-[#6E3027] mx-auto flex items-center justify-center text-[#6E3027]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-3xl text-[#241A14] font-light">
                INQUIRY REGISTERED
              </h4>
              <p className="font-serif italic text-base text-[#6E3027]">
                "The stone awaits its sanctuary."
              </p>
              <p className="text-xs font-sans text-[#524035] max-w-sm mx-auto leading-relaxed">
                Our atelier curator in Jaipur has received your confidential inquiry for {items.length} works. You will be contacted within 24 hours with architectural provenance dossiers and white-glove logistics.
              </p>
              <div className="pt-6">
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    onClearItems();
                    onClose();
                  }}
                  data-cursor="pointer"
                  className="px-6 py-3 border border-[#6E3027] bg-[#6E3027] text-[#F2EBDD] text-xs font-sans tracking-[0.25em] uppercase hover:bg-[#241A14]"
                >
                  RETURN TO ARCHIVE
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <p className="font-serif text-2xl text-[#241A14] font-light">
                Your dossier is empty.
              </p>
              <p className="text-xs font-sans text-[#8C613C] tracking-[0.15em] uppercase max-w-xs mx-auto">
                Explore the permanent collection and add handcrafted stone or silver works to request private valuation.
              </p>
              <button
                onClick={onClose}
                data-cursor="pointer"
                className="mt-4 px-6 py-2.5 border border-[#B98B62] text-xs font-sans tracking-[0.2em] uppercase text-[#6E3027] hover:bg-[#E7DBCA]"
              >
                DISCOVER OBJECTS
              </button>
            </div>
          ) : (
            <>
              {/* Selected Items List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-sans tracking-[0.25em] text-[#8C613C] uppercase font-semibold">
                  <span>SELECTED ARCHIVAL WORKS ({items.length})</span>
                  <button
                    onClick={onClearItems}
                    className="hover:text-[#6E3027] transition-colors"
                  >
                    CLEAR ALL
                  </button>
                </div>

                <div className="divide-y divide-[#D8C5A5] border-y border-[#D8C5A5]">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-4 flex items-center space-x-4"
                    >
                      <div className="relative w-16 h-20 overflow-hidden border border-[#D8C5A5] bg-[#E7DBCA] flex-shrink-0">
                        <Image
                          src={item.product.heroImage}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#6E3027] font-semibold">
                          {item.product.origin.split(',')[0]} · {item.product.edition}
                        </span>
                        <h5 className="font-serif text-base text-[#241A14] truncate mt-0.5">
                          {item.product.name}
                        </h5>
                        <p className="text-xs font-sans text-[#524035]">
                          {item.product.material}
                        </p>
                        <p className="font-serif text-sm text-[#241A14] mt-1 font-medium">
                          {item.product.priceFormatted}
                        </p>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        data-cursor="pointer"
                        aria-label={`Remove ${item.product.name}`}
                        className="p-2 text-[#8C613C] hover:text-[#6E3027] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Estimated Valuation */}
              <div className="p-4 bg-[#EDE4D3] border border-[#D8C5A5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#8C613C] block font-semibold">
                    TOTAL ARCHIVAL VALUATION
                  </span>
                  <p className="text-[11px] text-[#524035] mt-0.5">
                    Includes wooden crate packaging & transit insurance
                  </p>
                </div>
                <span className="font-serif text-2xl text-[#241A14] font-medium">
                  ₹ {totalValue.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Collector Inquiry Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#6E3027] font-bold block">
                  SUBMIT CONFIDENTIAL INQUIRY
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#8C613C] block mb-1 font-semibold">
                      COLLECTOR NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vikramaditya Rathore"
                      className="w-full px-3 py-2 bg-[#F9F6F0] border border-[#D8C5A5] text-xs text-[#241A14] focus:border-[#6E3027] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#8C613C] block mb-1 font-semibold">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="curator@residence.com"
                      className="w-full px-3 py-2 bg-[#F9F6F0] border border-[#D8C5A5] text-xs text-[#241A14] focus:border-[#6E3027] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#8C613C] block mb-1 font-semibold">
                      PHONE / WHATSAPP
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98290 00000"
                      className="w-full px-3 py-2 bg-[#F9F6F0] border border-[#D8C5A5] text-xs text-[#241A14] focus:border-[#6E3027] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#8C613C] block mb-1 font-semibold">
                      DELIVERY DESTINATION / CITY *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai / London / Dubai"
                      className="w-full px-3 py-2 bg-[#F9F6F0] border border-[#D8C5A5] text-xs text-[#241A14] focus:border-[#6E3027] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#8C613C] block mb-1 font-semibold">
                    INTENDED ARCHITECTURAL PLACEMENT / NOTES
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe placement (e.g. private residence courtyard, gallery plinth, bespoke dimensions)..."
                    className="w-full px-3 py-2 bg-[#F9F6F0] border border-[#D8C5A5] text-xs text-[#241A14] focus:border-[#6E3027] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-cursor="pointer"
                  className="w-full py-3.5 bg-[#241A14] hover:bg-[#6E3027] text-[#F2EBDD] font-sans text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_4px_16px_rgba(36,26,20,0.15)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>DISPATCH PRIVATE INQUIRY</span>
                </button>
              </form>

              {/* Guarantees */}
              <div className="pt-4 border-t border-[#D8C5A5] space-y-2 text-[11px] text-[#8C613C]">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 text-[#6E3027]" />
                  <span>Authenticated Certificate with Guild Sthapati signature & wax seal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-3.5 h-3.5 text-[#6E3027]" />
                  <span>Custom ISPM-15 fumigated timber crate & door-to-door white glove dispatch</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
