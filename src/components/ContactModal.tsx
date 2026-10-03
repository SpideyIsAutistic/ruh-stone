'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { CraftProduct } from '@/types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: CraftProduct | null;
}

export default function ContactModal({
  isOpen,
  onClose,
  initialProduct,
}: ContactModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: initialProduct
      ? `I would like to enquire about bespoke commissioning or availability for ${initialProduct.name}.`
      : '',
    inquiryType: 'Artisan Commission',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E8E0D2] shadow-2xl p-8 sm:p-12">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#23201D] hover:text-[#AA9B87] transition-colors"
          aria-label="Close Contact Modal"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {submitted ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#3A3027] text-[#FAF7F2] flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-3xl text-[#23201D] font-light mb-2">
              Message Received
            </h3>
            <p className="text-xs text-[#7A746C] max-w-sm mx-auto mb-8 leading-relaxed">
              Our atelier team will respond within 24 hours regarding craft availability, custom commissions, and artisan lead times.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-[#23201D] text-[#FAF7F2] text-[11px] font-sans tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-[#3A3027] transition-colors"
            >
              CLOSE WINDOW
            </button>
          </div>
        ) : (
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-2">
              ATELIER INQUIRY & COMMISSIONS
            </span>
            <h2 className="font-serif text-3xl text-[#23201D] font-light mb-3">
              Connect with RUH STONE
            </h2>
            <p className="text-xs text-[#7A746C] font-light mb-8 max-w-md">
              Whether you wish to commission a bespoke sculpted piece, enquire about wedding gift registries, or explore curation for private spaces, we welcome your conversation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5">
                    NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5">
                    PHONE
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5">
                    NATURE OF INQUIRY
                  </label>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  >
                    <option value="Artisan Commission">Bespoke Artisan Commission</option>
                    <option value="Product Availability">Product Availability & Dimensions</option>
                    <option value="Interior Curation">Interior Styling & Curation</option>
                    <option value="Wedding Registry">Wedding & Heirloom Registry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5">
                  MESSAGE / OBJECT DETAILS *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Share details regarding your requested piece, material preference, or timeline..."
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] py-4 text-[11px] font-sans tracking-[0.24em] uppercase transition-colors"
              >
                SUBMIT ATELIER INQUIRY
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
