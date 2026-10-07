import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getOrderById } from '@/lib/orders';
import { getShiprocketTracking } from '@/lib/shiprocket';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import OrderTrackingClientWrapper from './OrderTrackingClientWrapper';
import {
  Package,
  Truck,
  MapPin,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Metadata } from 'next';

interface OrderDetailProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderDetailProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order #${orderId} | RUH STONE Atelier`,
    description: `Consignment details and provenance journey for order #${orderId}.`,
    robots: { index: false, follow: false },
  };
}

export default async function AccountOrderDetailPage({ params }: OrderDetailProps) {
  const { orderId } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirect=/account/orders/${orderId}`);
  }

  const order = await getOrderById(orderId);
  if (!order) {
    notFound();
  }

  // Authorization check: if order is linked to a user, it must match current user
  if (order.userId && order.userId !== user.id) {
    notFound();
  }

  // Initial tracking fetch
  let tracking = null;
  const trackingKey = order.shiprocketAWB || order.shiprocketShipmentId;
  if (trackingKey) {
    tracking = await getShiprocketTracking(String(trackingKey), { orderId: order.id });
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] flex flex-col selection:bg-[#D1C2AC]/50">
      <Navbar cartCount={0} onOpenCart={() => {}} onOpenContact={() => {}} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/account?tab=orders"
            className="inline-flex items-center space-x-2 text-[11px] font-sans tracking-[0.2em] uppercase text-[#7A746C] hover:text-[#23201D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Orders</span>
          </Link>
        </div>

        {/* Atelier Order Header Card */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F2ECE1] gap-4">
            <div>
              <span className="text-[10px] uppercase font-sans tracking-[0.28em] text-[#AA9B87] font-medium block">
                RUH STONE · CERTIFIED CONSIGNMENT
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#23201D] mt-1 font-light">
                ORDER #{order.orderNumber || order.id}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`text-[10px] font-sans uppercase tracking-[0.2em] px-3 py-1 border ${
                  order.orderStatus === 'delivered'
                    ? 'bg-[#F2F8F4] text-[#2A6638] border-[#CDE5D4]'
                    : 'bg-[#FAF7F2] text-[#23201D] border-[#D1C2AC]'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
                Acquisition Date
              </span>
              <span className="font-medium text-[#23201D] mt-1 block">{formattedDate}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
                Payment Status
              </span>
              <span className="font-medium text-[#2A6638] mt-1 block uppercase">
                {order.paymentStatus === 'paid' ? 'Verified Paid' : order.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
                Payment Reference
              </span>
              <span className="font-mono text-[11px] text-[#23201D] mt-1 block">
                {order.razorpayPaymentId || 'Prepaid Secure'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
                Total Amount
              </span>
              <span className="font-serif text-sm font-medium text-[#23201D] mt-1 block">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Tracking Stepper with Refresh capability */}
        <div className="mb-8">
          <OrderTrackingClientWrapper
            orderId={order.id}
            initialOrderStatus={order.orderStatus}
            initialPaymentStatus={order.paymentStatus}
            initialCourier={order.shiprocketCourier}
            initialAwb={order.shiprocketAWB}
            initialTrackingUrl={order.shiprocketTrackingUrl}
            initialTracking={tracking}
          />
        </div>

        {/* Products Breakdown Table */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-8 mb-8 shadow-xs">
          <h2 className="font-serif text-xl text-[#23201D] font-normal pb-4 border-b border-[#F2ECE1] mb-6">
            Handcrafted Pieces & Provenance
          </h2>

          <div className="divide-y divide-[#F2ECE1]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#F0EAE1] border border-[#E8E0D2] relative overflow-hidden shrink-0">
                    {item.heroImage ? (
                      <SafeImage
                        src={item.heroImage}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#AA9B87]">
                        <Package className="w-6 h-6 stroke-[1]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-[#23201D]">{item.name}</h3>
                    <span className="text-xs text-[#7A746C] block mt-0.5">
                      Quantity: {item.quantity} · {item.material || 'Natural Stone'}
                    </span>
                    <span className="text-[11px] font-mono text-[#AA9B87]">SKU: RUH-{item.productId}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-serif text-sm text-[#23201D] font-medium block">
                    ₹{(item.priceNumeric * item.quantity).toLocaleString('en-IN')}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-[10px] text-[#7A746C]">
                      ₹{item.priceNumeric.toLocaleString('en-IN')} each
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="mt-6 pt-6 border-t border-[#E8E0D2] space-y-2.5 max-w-xs ml-auto text-xs">
            <div className="flex justify-between text-[#7A746C]">
              <span>Subtotal</span>
              <span className="font-serif text-sm text-[#23201D]">
                ₹{order.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-[#7A746C]">
              <span>White Glove Logistics</span>
              <span className="text-[#2A6638] uppercase font-medium">Complimentary</span>
            </div>
            {Boolean(order.discountAmount && order.discountAmount > 0) && (
              <div className="flex justify-between text-[#2A6638]">
                <span>Privilege Discount</span>
                <span>-₹{order.discountAmount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-3 border-t border-[#23201D] flex justify-between font-serif text-base text-[#23201D] font-medium">
              <span>Total Paid</span>
              <span>₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Consignment Address Card */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-8 shadow-xs">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-[#F2ECE1] mb-5">
            <MapPin className="w-4 h-4 text-[#AA9B87] stroke-[1.5]" />
            <h3 className="font-serif text-lg text-[#23201D] font-normal">
              Delivery Destination & Patron Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div>
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block mb-1">
                Recipient
              </span>
              <div className="font-medium text-[#23201D]">{order.customer.name}</div>
              <div className="text-[#7A746C]">{order.customer.phone}</div>
              <div className="text-[#7A746C]">{order.customer.email}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block mb-1">
                Destination Address
              </span>
              <div className="text-[#57524A]">{order.customer.address}</div>
              <div className="text-[#57524A]">
                {order.customer.city}, {order.customer.state || 'India'} - {order.customer.pincode}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
