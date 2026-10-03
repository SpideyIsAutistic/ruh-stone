'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, Check, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { CartItem, getEffectivePrice } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
}: CartDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    giftNote: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  if (!isOpen) return null;

  // Calculate subtotal taking active sale prices into account
  const subtotal = items.reduce(
    (acc, item) => acc + getEffectivePrice(item.product).numeric * item.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    onClearCart();
    setSubmitted(false);
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E8E0D2] shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-300">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E8E0D2]">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl text-[#23201D] font-light">
                Shopping Cart
              </span>
              <span className="text-xs text-[#7A746C] font-sans">
                ({items.length} {items.length === 1 ? 'piece' : 'pieces'})
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#23201D] hover:text-[#AA9B87] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto py-6">
            {submitted ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#3A3027] text-[#FAF7F2] flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-2xl text-[#23201D] font-light mb-2">
                  Order Confirmed
                </h3>
                <p className="text-xs text-[#7A746C] leading-relaxed max-w-xs mb-6">
                  Thank you, {formData.name || 'Patron'}. Your handmade pieces are being carefully packaged with artisan provenance certificates.
                </p>
                <div className="bg-[#ECE4D6] p-4 text-[11px] font-mono text-[#23201D] w-full text-left mb-6 space-y-1">
                  <div>REF: RUH-{(Math.random() * 80000 + 10000).toFixed(0)}</div>
                  <div>RECIPIENT: {formData.name}</div>
                  <div>DESTINATION: {formData.city || 'India'}</div>
                  <div>TOTAL: ₹{subtotal.toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-[#23201D] text-[#FAF7F2] text-[11px] font-sans tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-[#3A3027] transition-colors"
                >
                  RETURN TO ATELIER
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-10 h-10 text-[#D1C2AC] mb-4 stroke-[1.2]" />
                <p className="font-serif text-lg text-[#23201D] font-light mb-2">
                  Your cart is empty
                </p>
                <p className="text-xs text-[#7A746C] max-w-xs mb-6">
                  Discover handcrafted vessels, carved stone objects, and heirloom decor in our collection.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#23201D] text-[#FAF7F2] text-[11px] font-sans tracking-[0.2em] uppercase px-6 py-3"
                >
                  EXPLORE SHOP
                </button>
              </div>
            ) : step === 'cart' ? (
              <div className="space-y-6">
                {items.map((item, index) => (
                  <div
                    key={`${item.product.id}-${index}`}
                    className="flex space-x-4 pb-6 border-b border-[#E8E0D2]"
                  >
                    <div className="relative w-20 h-24 overflow-hidden bg-[#ECE4D6] shrink-0">
                      <Image
                        src={item.product.heroImage}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-serif text-base text-[#23201D] leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="text-[#7A746C] hover:text-[#23201D] p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>
                        <span className="text-[10px] text-[#7A746C] block mt-1">
                          {item.product.material} · {item.product.origin}
                        </span>
                        <div className="mt-1">
                          {getEffectivePrice(item.product).isOnSale ? (
                            <div className="flex items-center gap-1.5 text-xs font-serif">
                              <span className="font-semibold text-[#8B3A2B]">
                                {getEffectivePrice(item.product).price}
                              </span>
                              <span className="text-[#7A746C] line-through text-[11px]">
                                {item.product.price}
                              </span>
                              <span className="text-[8px] font-sans text-[#FAF7F2] bg-[#8B3A2B] uppercase tracking-wider px-1 py-0.2">
                                SALE
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-[#23201D] block">
                              {item.product.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-[11px] text-[#7A746C]">Qty</span>
                        <div className="flex items-center space-x-2 border border-[#D1C2AC] px-2 py-0.5">
                          <button
                            onClick={() =>
                              onUpdateQuantity(index, Math.max(1, item.quantity - 1))
                            }
                            className="text-xs text-[#7A746C] hover:text-[#23201D]"
                          >
                            -
                          </button>
                          <span className="text-xs tabular-nums w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              const maxStock =
                                typeof item.product.stockQuantity === 'number'
                                  ? item.product.stockQuantity
                                  : 99;
                              if (item.quantity < maxStock) {
                                onUpdateQuantity(index, item.quantity + 1);
                              }
                            }}
                            disabled={
                              typeof item.product.stockQuantity === 'number' &&
                              item.quantity >= item.product.stockQuantity
                            }
                            className={`text-xs text-[#7A746C] hover:text-[#23201D] ${
                              typeof item.product.stockQuantity === 'number' &&
                              item.quantity >= item.product.stockQuantity
                                ? 'opacity-30 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Step 2: Shipping & Patron Details */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1">
                      EMAIL *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1">
                      PHONE *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1">
                    DELIVERY ADDRESS *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1">
                      CITY *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1">
                      PIN CODE *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1">
                    GIFT NOTE OR SPECIAL REQUESTS (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={formData.giftNote}
                    onChange={(e) => setFormData({ ...formData, giftNote: e.target.value })}
                    placeholder="Handwritten card note or bespoke packaging..."
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] py-4 text-[11px] font-sans tracking-[0.22em] uppercase transition-colors mt-2"
                >
                  PLACE ORDER · ₹{subtotal.toLocaleString('en-IN')}
                </button>
              </form>
            )}
          </div>

          {/* Drawer Footer Actions */}
          {!submitted && items.length > 0 && (
            <div className="pt-6 border-t border-[#E8E0D2] flex flex-col space-y-3">
              {step === 'cart' ? (
                <>
                  <div className="flex items-center justify-between text-xs text-[#7A746C]">
                    <span>Shipping</span>
                    <span className="font-medium text-[#23201D]">Complimentary (India)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-[#23201D] pt-1">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] py-4 text-[11px] font-sans tracking-[0.22em] uppercase transition-colors"
                  >
                    PROCEED TO CHECKOUT →
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStep('cart')}
                  className="w-full text-center text-xs font-sans tracking-wider text-[#7A746C] hover:text-[#23201D] py-2"
                >
                  ← RETURN TO CART
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
