'use client';

import React, { useState, useEffect } from 'react';
import SafeImage from './SafeImage';
import Link from 'next/link';
import { X, Trash2, Check, ArrowRight, ShoppingBag, ShieldCheck, Loader2 } from 'lucide-react';
import { CartItem, getEffectivePrice } from '@/types';
import AuthModal from './AuthModal';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onClearCart: () => void;
  onRestoreCart?: (items: CartItem[]) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onRestoreCart,
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
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Patron Auth & Saved Addresses State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Load Razorpay Checkout Script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const loadPatronData = () => {
    fetch('/api/account/profile')
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data && data.profile) {
          setFormData((prev) => ({
            ...prev,
            name: prev.name || data.profile.full_name || '',
            email: prev.email || data.email || '',
            phone: prev.phone || data.profile.phone || '',
          }));
        }
      })
      .catch(() => {});

    fetch('/api/account/addresses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          const def = data.addresses.find((a: any) => a.is_default) || data.addresses[0];
          if (def) {
            setSelectedAddressId(def.id);
            setFormData((prev) => ({
              ...prev,
              name: prev.name || def.full_name || '',
              phone: prev.phone || def.phone || '',
              address: prev.address || `${def.address_line_1}${def.address_line_2 ? ', ' + def.address_line_2 : ''}`,
              city: prev.city || def.city || '',
              pincode: prev.pincode || def.postal_code || '',
            }));
          }
        }
      })
      .catch(() => {});
  };

  // Fetch Patron Profile & Saved Addresses for 1-click checkout
  useEffect(() => {
    if (!isOpen) return;
    loadPatronData();
  }, [isOpen]);

  // Restore Cart from URL token (?restore=token)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const restoreToken = params.get('restore');
    if (restoreToken) {
      fetch(`/api/cart/restore?token=${restoreToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.items && data.items.length > 0) {
            if (onRestoreCart) {
              onRestoreCart(data.items);
            }
            if (data.customer) {
              setFormData((prev) => ({
                ...prev,
                ...data.customer,
              }));
            }
          }
        })
        .catch((err) => console.warn('Cart restoration error:', err));
    }
  }, [onRestoreCart]);

  if (!isOpen) return null;

  // Calculate subtotal taking active sale prices into account
  const subtotal = items.reduce(
    (acc, item) => acc + getEffectivePrice(item.product).numeric * item.quantity,
    0
  );

  // Email capture on blur for Abandoned Cart recovery automation
  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes('@') || items.length === 0) return;

    try {
      await fetch('/api/cart/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          customer: formData,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            priceNumeric: getEffectivePrice(i.product).numeric,
          })),
          subtotal,
        }),
      });
    } catch (e) {
      // Background non-blocking capture
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Create order on server (server validates prices and initiates Razorpay)
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      const { orderId, razorpayOrderId, amount, currency, keyId } = orderData;

      // Ensure Razorpay SDK script is loaded
      if (typeof window !== 'undefined' && !window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      }

      // 2. Trigger Razorpay Checkout Modal
      if (typeof window !== 'undefined' && window.Razorpay && !keyId.includes('placeholder')) {
        const rzpOptions = {
          key: keyId,
          amount: amount,
          currency: currency || 'INR',
          name: 'RUH STONE',
          description: `Consignment of ${items.length} handcrafted pieces`,
          image: '/icon.png',
          order_id: razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#23201D',
          },
          handler: async function (response: any) {
            // 3. Verify Payment on Server
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setConfirmedOrderId(orderId);
              setSubmitted(true);
              setIsProcessing(false);
              onClearCart();
            } else {
              setErrorMessage(verifyData.error || 'Payment verification failed');
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(rzpOptions);
        razorpayInstance.on('payment.failed', function (resp: any) {
          setErrorMessage(resp.error?.description || 'Payment was unsuccessful.');
          setIsProcessing(false);
        });
        razorpayInstance.open();
      } else {
        // Test Simulation Mode (when test placeholders are in place without live keys)
        // Automatically completes payment verification seamlessly
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'test_verified',
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setConfirmedOrderId(orderId);
          setSubmitted(true);
          setIsProcessing(false);
          onClearCart();
        } else {
          setErrorMessage(verifyData.error || 'Payment verification failed');
          setIsProcessing(false);
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred during checkout');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    onClearCart();
    setSubmitted(false);
    setConfirmedOrderId('');
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
              <div className="py-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#3A3027] text-[#FAF7F2] flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-2xl text-[#23201D] font-light mb-2">
                  Order Confirmed
                </h3>
                <p className="text-xs text-[#7A746C] leading-relaxed max-w-xs mb-6">
                  Thank you, {formData.name || 'Patron'}. Your handmade pieces are being carefully packaged with artisan provenance certificates.
                </p>

                <div className="bg-[#ECE4D6] p-4 text-[11px] font-mono text-[#23201D] w-full text-left mb-6 space-y-1.5">
                  <div>REF: {confirmedOrderId}</div>
                  <div>RECIPIENT: {formData.name}</div>
                  <div>DESTINATION: {formData.city || 'India'}</div>
                  <div>PAYMENT: VERIFIED PREPAID (RAZORPAY)</div>
                  <div>SHIPPING: INSURED WHITE-GLOVE ATELIER</div>
                </div>

                <div className="w-full space-y-3">
                  <Link
                    href={isLoggedIn ? `/account/orders/${confirmedOrderId}` : `/track-order?orderNumber=${confirmedOrderId}`}
                    className="block w-full bg-[#23201D] text-[#FAF7F2] text-[11px] font-sans tracking-[0.2em] uppercase py-3.5 hover:bg-[#3A3027] transition-colors text-center"
                  >
                    TRACK CONSIGNMENT & PROVENANCE →
                  </Link>

                  {isLoggedIn ? (
                    <Link
                      href="/account?tab=orders"
                      className="block w-full border border-[#D1C2AC] text-[#23201D] text-[10px] font-sans tracking-[0.2em] uppercase py-3 hover:bg-[#ECE4D6] transition-colors text-center"
                    >
                      VIEW MY PATRON ACCOUNT & ORDERS
                    </Link>
                  ) : (
                    <Link
                      href={`/signup?redirect=${encodeURIComponent(`/account/orders/${confirmedOrderId}`)}`}
                      className="block w-full border border-[#D1C2AC] text-[#23201D] text-[10px] font-sans tracking-[0.2em] uppercase py-3 hover:bg-[#ECE4D6] transition-colors text-center"
                    >
                      CREATE PATRON ACCOUNT
                    </Link>
                  )}

                  <button
                    onClick={handleReset}
                    className="block w-full text-[#7A746C] text-[10px] font-sans tracking-[0.2em] uppercase py-2 hover:text-[#23201D] transition-colors text-center"
                  >
                    RETURN TO ATELIER
                  </button>
                </div>
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
                      <SafeImage
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
              /* Step 2: Shipping & Patron Details with Live Validation */
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-[#8B3A2B]/10 border border-[#8B3A2B]/30 text-[#8B3A2B] text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Patron Sign In Option */}
                {!isLoggedIn && (
                  <div className="bg-[#F4EFE6] border border-[#E8E0D2] p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif text-xs text-[#23201D] font-medium block">
                        Already have an account?
                      </span>
                      <span className="text-[10px] text-[#7A746C] block mt-0.5">
                        Sign in for 1-click address autofill & orders tracking.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#23201D] text-[#FAF7F2] text-[10px] uppercase tracking-wider font-sans hover:bg-[#3D3731] transition-colors shrink-0 ml-3"
                    >
                      Sign In
                    </button>
                  </div>
                )}

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
                      onBlur={handleEmailBlur}
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

                {/* Saved Patron Addresses Selector */}
                {savedAddresses.length > 0 && (
                  <div className="bg-[#F4EFE6] border border-[#E8E0D2] p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#23201D] font-medium">
                        USE SAVED ATELIER ADDRESS
                      </span>
                      <span className="text-[10px] text-[#AA9B87]">
                        {savedAddresses.length} saved
                      </span>
                    </div>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedAddressId(id);
                        const chosen = savedAddresses.find((a) => a.id === id);
                        if (chosen) {
                          setFormData((prev) => ({
                            ...prev,
                            name: chosen.full_name || prev.name,
                            phone: chosen.phone || prev.phone,
                            address: `${chosen.address_line_1}${chosen.address_line_2 ? ', ' + chosen.address_line_2 : ''}`,
                            city: chosen.city || prev.city,
                            pincode: chosen.postal_code || prev.pincode,
                          }));
                        }
                      }}
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3 py-2 text-xs text-[#23201D] focus:outline-none"
                    >
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.full_name} — {addr.address_line_1}, {addr.city} ({addr.postal_code}) {addr.is_default ? '★ Default' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                    GIFT NOTE OR BESPOKE REQUEST (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={formData.giftNote}
                    onChange={(e) => setFormData({ ...formData, giftNote: e.target.value })}
                    placeholder="Handwritten card note or special packaging..."
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] py-4 text-[11px] font-sans tracking-[0.22em] uppercase transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>PREPARING SECURE CHECKOUT...</span>
                      </>
                    ) : (
                      <span>PAY VIA RAZORPAY · ₹{subtotal.toLocaleString('en-IN')}</span>
                    )}
                  </button>
                  <p className="text-[10px] text-[#7A746C] text-center mt-2 flex items-center justify-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>256-Bit Encrypted · Razorpay Verified Gateway</span>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Drawer Footer Actions */}
          {!submitted && items.length > 0 && (
            <div className="pt-6 border-t border-[#E8E0D2] flex flex-col space-y-3">
              {step === 'cart' ? (
                <>
                  <div className="flex items-center justify-between text-xs text-[#7A746C]">
                    <span>Insured White-Glove Shipping</span>
                    <span className="font-medium text-[#2A6638]">Complimentary (India)</span>
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

              <div className="pt-1 text-center text-[10px] text-[#7A746C] tracking-wide">
                <span>Concierge Assistance: </span>
                <a
                  href="mailto:support@ruhstone.com"
                  className="text-[#23201D] underline underline-offset-4 hover:text-[#AA9B87] transition-colors font-medium"
                >
                  support@ruhstone.com
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal Popup for 1-Click Checkout */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          loadPatronData();
        }}
      />
    </div>
  );
}
