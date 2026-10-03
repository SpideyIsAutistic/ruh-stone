import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/orders';
import { getShiprocketTracking } from '@/lib/shiprocket';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Metadata } from 'next';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${id} | RUH STONE Atelier`,
    description: `Track your handcrafted pieces and view provenance details for order ${id}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  let tracking = null;
  const trackingKey = order.shiprocketAWB || order.shiprocketShipmentId;
  if (trackingKey) {
    tracking = await getShiprocketTracking(String(trackingKey));
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isDelivered = order.orderStatus === 'delivered';
  const isShipped = order.orderStatus === 'shipped' || isDelivered;
  const isConfirmed = order.orderStatus !== 'pending' && order.paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] flex flex-col selection:bg-[#D1C2AC]/50">
      <Navbar cartCount={0} onOpenCart={() => {}} onOpenContact={() => {}} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20">
        {/* Header Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-[11px] font-sans tracking-[0.24em] text-[#7A746C] hover:text-[#23201D] uppercase transition-colors"
          >
            ← Back to Atelier
          </Link>
        </div>

        {/* Confirmation Hero Banner */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-8 md:p-12 mb-8 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#3A3027] text-[#FAF7F2] flex items-center justify-center mb-5">
            <CheckCircle2 className="w-7 h-7 stroke-[1.5]" />
          </div>

          <span className="text-[11px] font-sans tracking-[0.28em] uppercase text-[#AA9B87] block mb-2">
            Verified Consignment
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#23201D] font-light mb-3">
            Thank You, {order.customer.name}
          </h1>
          <p className="text-xs md:text-sm text-[#7A746C] max-w-lg mx-auto leading-relaxed">
            Your acquisition has been recorded. Each piece is being inspected and prepared
            with archival packaging at our Jaipur atelier.
          </p>

          <div className="mt-8 pt-6 border-t border-[#F2ECE1] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block">
                Reference
              </span>
              <span className="font-mono text-xs text-[#23201D] font-medium mt-1 block">
                {order.id}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block">
                Date
              </span>
              <span className="text-xs text-[#23201D] font-medium mt-1 block">
                {orderDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block">
                Payment
              </span>
              <span className="text-xs text-[#2A6638] font-medium mt-1 block uppercase">
                {order.paymentStatus === 'paid' ? 'Verified Prepaid' : order.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block">
                Total Amount
              </span>
              <span className="font-serif text-sm text-[#23201D] font-medium mt-1 block">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Tracking & Timeline */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-8 mb-8">
          <div className="flex items-center justify-between pb-6 border-b border-[#F2ECE1] mb-6">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-[#23201D] stroke-[1.5]" />
              <h2 className="font-serif text-lg text-[#23201D] font-normal">
                Shipment & Provenance Journey
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 bg-[#F5EFE6] text-[#7A746C] border border-[#E8E0D2]">
              {order.orderStatus}
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative py-4">
            {/* Step 1 */}
            <div className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isConfirmed ? 'bg-[#23201D] text-[#FAF7F2]' : 'bg-[#ECE4D6] text-[#7A746C]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-[#23201D]">
                  1. Order Placed
                </h4>
                <p className="text-[11px] text-[#7A746C] mt-1">
                  Payment confirmed. Artisan documentation issued.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isShipped ? 'bg-[#23201D] text-[#FAF7F2]' : 'bg-[#ECE4D6] text-[#7A746C]'
                }`}
              >
                <Package className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-[#23201D]">
                  2. Atelier Crating & Transit
                </h4>
                <p className="text-[11px] text-[#7A746C] mt-1">
                  {order.shiprocketCourier
                    ? `${order.shiprocketCourier} · AWB: ${order.shiprocketAWB || 'Assigned'}`
                    : 'Hand-packed in reinforced archival packaging.'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isDelivered ? 'bg-[#23201D] text-[#FAF7F2]' : 'bg-[#ECE4D6] text-[#7A746C]'
                }`}
              >
                <MapPin className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-[#23201D]">
                  3. Patron Handover
                </h4>
                <p className="text-[11px] text-[#7A746C] mt-1">
                  {order.customer.city}, {order.customer.pincode}
                </p>
              </div>
            </div>
          </div>

          {tracking && tracking.current_status && (
            <div className="mt-6 p-4 bg-[#FAF7F2] border border-[#E8E0D2] text-xs text-[#57524A] flex items-center space-x-3">
              <Sparkles className="w-4 h-4 text-[#AA9B87] shrink-0" />
              <span>
                <strong>Live Logistics Update:</strong> {tracking.current_status}
              </span>
            </div>
          )}
        </div>

        {/* Consignment Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Items List (2 cols) */}
          <div className="md:col-span-2 bg-[#FFFFFF] border border-[#E8E0D2] p-8">
            <h3 className="font-serif text-lg text-[#23201D] font-normal pb-4 border-b border-[#F2ECE1] mb-6">
              Handcrafted Items ({order.items.length})
            </h3>

            <div className="divide-y divide-[#F2ECE1]">
              {order.items.map((item) => (
                <div key={item.productId} className="py-4 flex space-x-4 items-center">
                  <div className="relative w-16 h-20 bg-[#ECE4D6] shrink-0 overflow-hidden">
                    <Image
                      src={item.heroImage}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif text-base text-[#23201D] hover:underline block truncate"
                    >
                      {item.name}
                    </Link>
                    <span className="text-[11px] text-[#7A746C] block mt-0.5">
                      {item.material || 'Artisan Craft'} · Qty: {item.quantity}
                    </span>
                    <span className="text-xs font-medium text-[#23201D] mt-1 block">
                      {item.priceFormatted}
                    </span>
                  </div>
                  <div className="text-right font-serif text-sm text-[#23201D]">
                    ₹{(item.priceNumeric * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#E8E0D2] space-y-2 text-xs">
              <div className="flex justify-between text-[#7A746C]">
                <span>Subtotal</span>
                <span className="text-[#23201D] font-serif">
                  ₹{order.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[#7A746C]">
                <span>White-Glove Atelier Shipping</span>
                <span className="text-[#2A6638]">Complimentary</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-medium text-[#23201D] pt-2 border-t border-[#F2ECE1]">
                <span>Total Amount Paid</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Patron Delivery & Provenance Note (1 col) */}
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 text-xs">
              <h4 className="text-[10px] font-sans uppercase tracking-[0.24em] text-[#7A746C] mb-3">
                Delivery Address
              </h4>
              <p className="font-medium text-[#23201D]">{order.customer.name}</p>
              <p className="text-[#57524A] mt-1 leading-relaxed">
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.pincode}
                <br />
                {order.customer.state || 'India'}
              </p>
              <div className="mt-4 pt-3 border-t border-[#F2ECE1] text-[11px] text-[#7A746C]">
                <div>Email: {order.customer.email}</div>
                <div>Phone: {order.customer.phone}</div>
              </div>
              {order.customer.giftNote && (
                <div className="mt-4 p-3 bg-[#FAF7F2] border border-[#E8E0D2] italic text-[11px] text-[#57524A]">
                  “{order.customer.giftNote}”
                </div>
              )}
            </div>

            <div className="bg-[#F5EFE6] border border-[#E8E0D2] p-6">
              <div className="flex items-center space-x-2 text-[#23201D] mb-2">
                <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium">
                  Artisan Provenance
                </span>
              </div>
              <p className="text-[11px] text-[#57524A] leading-relaxed">
                Every piece carries an individualized maker&apos;s mark and is dispatched with a
                hand-stamped certificate testifying to traditional Indian craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
