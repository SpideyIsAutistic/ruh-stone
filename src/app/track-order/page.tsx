'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderTrackingTimeline from '@/components/OrderTrackingTimeline';
import SafeImage from '@/components/SafeImage';
import {
  Search,
  Truck,
  Package,
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Order } from '@/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const initialContact = searchParams.get('contact') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [contact, setContact] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [verifiedOrder, setVerifiedOrder] = useState<any | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);

  // Authenticated User fast-lookup
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuthAndPreload() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setLoadingUserOrders(true);
          const res = await fetch('/api/account/orders');
          const data = await res.json();
          if (data.success && data.orders) {
            setUserOrders(data.orders);
            if (!contact && session.user.email) {
              setContact(session.user.email);
            }
          }
        }
      } catch {
        // Guest mode fallback
      } finally {
        setLoadingUserOrders(false);
      }
    }
    checkAuthAndPreload();
  }, []);

  const handleTrack = async (e?: React.FormEvent, directOrder?: string, directContact?: string) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const queryOrder = directOrder || orderNumber;
    const queryContact = directContact || contact;

    if (!queryOrder || !queryContact) {
      setErrorMessage('Please provide both your Order Number and Contact Email or Phone.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders/track-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: queryOrder.trim(),
          contact: queryContact.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error ||
            'No matching consignment could be verified with the provided details. Please check your order reference.'
        );
        setVerifiedOrder(null);
        setTrackingData(null);
      } else {
        setVerifiedOrder(data.order);
        setTrackingData(data.tracking);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to atelier tracking system.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-12 md:py-20">
      {/* Editorial Header */}
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[10px] uppercase font-sans tracking-[0.28em] text-[#AA9B87] font-medium block mb-2">
          WHITE-GLOVE CONSIGNMENT TRACKING
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#23201D] font-light tracking-wide">
          Track Your Acquisition
        </h1>
        <p className="text-xs md:text-sm text-[#7A746C] mt-2.5 max-w-lg mx-auto font-light leading-relaxed">
          Verify the artisan crafting, archival packaging, and real-time transit status of your handcrafted pieces.
        </p>
      </div>

      {/* Authenticated Fast Selector */}
      {userOrders.length > 0 && !verifiedOrder && (
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 mb-8 shadow-xs">
          <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#AA9B87] font-medium block mb-3">
            YOUR RECENT ATELIER ORDERS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userOrders.slice(0, 4).map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setOrderNumber(o.orderNumber || o.id);
                  handleTrack(undefined, o.orderNumber || o.id, o.customer?.email || contact);
                }}
                className="text-left border border-[#E8E0D2] hover:border-[#23201D] p-3.5 transition-colors bg-[#FAF7F2]/40 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-mono text-xs text-[#23201D] font-medium block">
                    #{o.orderNumber || o.id}
                  </span>
                  <span className="text-[11px] text-[#7A746C] mt-0.5 block">
                    ₹{o.total.toLocaleString('en-IN')} · {o.orderStatus}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#AA9B87]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Public Search Verification Form */}
      <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-8 sm:p-10 shadow-xs mb-10">
        <form onSubmit={(e) => handleTrack(e)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-2 font-medium">
                Order Reference / Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. RUH-2026-10258"
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] placeholder-[#AA9B87] focus:outline-none focus:border-[#23201D] font-mono transition-colors"
                />
                <Package className="w-3.5 h-3.5 text-[#AA9B87] absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-2 font-medium">
                Email or Phone Used
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="patron@example.com or +91 98765..."
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] placeholder-[#AA9B87] focus:outline-none focus:border-[#23201D] transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-[#AA9B87] absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
            <span className="text-[11px] text-[#7A746C] font-light">
              Security note: Consignment details are verified prior to disclosure.
            </span>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#23201D] hover:bg-[#3D352E] text-[#FAF7F2] px-8 py-3 text-xs font-sans uppercase tracking-[0.22em] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
              ) : (
                <>
                  <span>Locate Consignment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-6 p-4 bg-[#FFF5F5] border border-[#F5C2C2] text-[#B91C1C] text-xs flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Verified Order Results Display */}
      {verifiedOrder && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Order Header Summary */}
          <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F2ECE1] gap-4">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.28em] text-[#AA9B87] font-medium block">
                  CONSIGNMENT VERIFIED
                </span>
                <h2 className="font-serif text-2xl text-[#23201D] mt-1 font-light">
                  Order #{verifiedOrder.orderNumber || verifiedOrder.id}
                </h2>
              </div>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] px-3 py-1 bg-[#FAF7F2] text-[#23201D] border border-[#D1C2AC]">
                {verifiedOrder.orderStatus}
              </span>
            </div>

            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
                  Recipient
                </span>
                <span className="font-medium text-[#23201D] mt-1 block">
                  {verifiedOrder.customerName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
                  Destination
                </span>
                <span className="font-medium text-[#23201D] mt-1 block">
                  {verifiedOrder.city} ({verifiedOrder.pincode})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
                  Payment
                </span>
                <span className="text-[#2A6638] uppercase font-medium mt-1 block">
                  {verifiedOrder.paymentStatus === 'paid' ? 'Verified Prepaid' : verifiedOrder.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
                  Total
                </span>
                <span className="font-serif text-sm font-medium text-[#23201D] mt-1 block">
                  ₹{verifiedOrder.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Tracking Stepper */}
          <OrderTrackingTimeline
            orderStatus={verifiedOrder.orderStatus}
            paymentStatus={verifiedOrder.paymentStatus}
            courierName={verifiedOrder.shiprocketCourier}
            awb={verifiedOrder.shiprocketAWB}
            trackingUrl={verifiedOrder.shiprocketTrackingUrl}
            estimatedDelivery={
              trackingData?.estimated_delivery ||
              trackingData?.tracking_data?.etd ||
              '4-7 business days'
            }
            latestUpdate={
              trackingData?.current_status ||
              trackingData?.scans?.[0]?.activity ||
              trackingData?.tracking_data?.track_status ||
              'Prepared at Jaipur Atelier'
            }
            scans={trackingData?.scans}
            onRefresh={() => handleTrack()}
            isRefreshing={loading}
          />

          {/* Products Summary */}
          {verifiedOrder.items && verifiedOrder.items.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-8 shadow-xs">
              <h3 className="font-serif text-xl text-[#23201D] pb-4 border-b border-[#F2ECE1] mb-5 font-normal">
                Pieces in This Consignment
              </h3>
              <div className="divide-y divide-[#F2ECE1]">
                {verifiedOrder.items.map((item: any, i: number) => (
                  <div key={i} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif text-sm text-[#23201D] block">{item.name}</span>
                      <span className="text-[#7A746C] mt-0.5 block">Quantity: {item.quantity}</span>
                    </div>
                    <span className="font-serif text-sm text-[#23201D] font-medium">
                      ₹{(item.priceNumeric * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] flex flex-col selection:bg-[#D1C2AC]/50">
      <Navbar cartCount={0} onOpenCart={() => {}} onOpenContact={() => {}} />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#AA9B87] mx-auto mb-2" />
              <span className="text-xs uppercase tracking-widest text-[#7A746C]">Loading Tracking...</span>
            </div>
          }
        >
          <TrackOrderContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
