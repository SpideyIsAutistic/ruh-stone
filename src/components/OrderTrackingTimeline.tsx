'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  Truck,
  Package,
  CreditCard,
  Home,
  AlertCircle,
  RefreshCw,
  Clock,
  ExternalLink,
} from 'lucide-react';

export interface OrderTrackingTimelineProps {
  orderStatus: string;
  paymentStatus: string;
  courierName?: string;
  awb?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  latestUpdate?: string;
  scans?: Array<{
    date?: string;
    activity?: string;
    location?: string;
  }>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function OrderTrackingTimeline({
  orderStatus = 'pending',
  paymentStatus = 'pending',
  courierName,
  awb,
  trackingUrl,
  estimatedDelivery,
  latestUpdate,
  scans,
  onRefresh,
  isRefreshing = false,
}: OrderTrackingTimelineProps) {
  const normStatus = (orderStatus || '').toLowerCase();
  const isPaid = (paymentStatus || '').toLowerCase() === 'paid';

  // Determine stage progression: 1..6
  let currentStage = 1; // Order Placed
  if (isPaid || normStatus === 'confirmed') currentStage = 2; // Payment Confirmed
  if (normStatus === 'packed' || normStatus === 'processing') currentStage = 3; // Order Packed
  if (normStatus === 'shipped' || normStatus === 'in_transit' || normStatus === 'in transit') currentStage = 4; // Shipped / In Transit
  if (normStatus === 'out_for_delivery' || normStatus === 'out for delivery') currentStage = 5; // Out for Delivery
  if (normStatus === 'delivered') currentStage = 6; // Delivered

  const isCancelled = normStatus === 'cancelled';
  const isReturned = normStatus === 'returned' || normStatus === 'rto';
  const isException = normStatus === 'exception' || normStatus === 'ndr';

  const steps = [
    { label: 'ORDER CONFIRMED', sub: 'Received at atelier' },
    { label: 'PAYMENT CONFIRMED', sub: 'Verified via Razorpay' },
    { label: 'ORDER PACKED', sub: 'Archival crating & sealed' },
    { label: 'SHIPPED', sub: 'Handed to courier' },
    { label: 'OUT FOR DELIVERY', sub: 'Arriving today' },
    { label: 'DELIVERED', sub: 'Sanctuary arrival' },
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 sm:p-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F2ECE1] gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.28em] text-[#AA9B87] font-medium block">
            CONSIGNMENT TRACKING
          </span>
          <h3 className="font-serif text-xl text-[#23201D] mt-0.5">
            Artisan Provenance & Journey
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 text-[10px] font-sans tracking-[0.2em] uppercase text-[#7A746C] hover:text-[#23201D] px-3 py-1.5 border border-[#E8E0D2] bg-[#FAF7F2] hover:bg-[#F2ECE1] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Refresh Tracking'}</span>
            </button>
          )}

          <span
            className={`text-[10px] font-sans uppercase tracking-[0.2em] px-3 py-1 border ${
              isDeliveredStatus(normStatus)
                ? 'bg-[#F2F8F4] text-[#2A6638] border-[#CDE5D4]'
                : isCancelled
                ? 'bg-[#FFF5F5] text-[#B91C1C] border-[#F5C2C2]'
                : 'bg-[#FAF7F2] text-[#23201D] border-[#D1C2AC]'
            }`}
          >
            {isCancelled ? 'CANCELLED' : isReturned ? 'RETURNED' : isException ? 'ATTENTION' : steps[Math.min(currentStage - 1, 5)].label}
          </span>
        </div>
      </div>

      {/* Exception Banner if any */}
      {(isCancelled || isReturned || isException) && (
        <div className="mt-6 p-4 bg-[#FFF5F5] border border-[#F5C2C2] text-[#B91C1C] text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Consignment Notice: </strong>
            {isCancelled
              ? 'This order has been cancelled upon request or verification.'
              : isReturned
              ? 'Consignment is undergoing return transit to the Jaipur atelier.'
              : 'Our logistics team is resolving a transit exception. Handcrafted packaging remains secure.'}
          </div>
        </div>
      )}

      {/* Visual Tracking Stepper (Desktop & Mobile) */}
      <div className="py-8">
        {/* Desktop Stepper */}
        <div className="hidden md:grid grid-cols-6 gap-2 relative">
          {/* Connector Line */}
          <div className="absolute top-4 left-[8%] right-[8%] h-[2px] bg-[#E8E0D2] z-0" />
          <div
            className="absolute top-4 left-[8%] h-[2px] bg-[#23201D] z-0 transition-all duration-500"
            style={{
              width: `${Math.max(0, Math.min(100, ((currentStage - 1) / (steps.length - 1)) * 84))}%`,
            }}
          />

          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = currentStage > stepNum;
            const isCurrent = currentStage === stepNum;

            return (
              <div key={step.label} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#23201D] text-[#FAF7F2] shadow-xs'
                      : isCurrent
                      ? 'bg-[#AA9B87] text-[#FAF7F2] ring-4 ring-[#FAF7F2] shadow-sm'
                      : 'bg-[#FFFFFF] text-[#AA9B87] border-2 border-[#E8E0D2]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 bg-[#FAF7F2] rounded-full animate-pulse" />
                  ) : (
                    <span className="text-[11px] font-mono">{stepNum}</span>
                  )}
                </div>

                <span
                  className={`mt-3 text-[10px] font-sans tracking-[0.16em] uppercase leading-tight font-medium ${
                    isCurrent || isCompleted ? 'text-[#23201D]' : 'text-[#7A746C]'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[9px] text-[#7A746C] mt-0.5 font-light">
                  {step.sub}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Stacked Stepper */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = currentStage > stepNum;
            const isCurrent = currentStage === stepNum;

            return (
              <div key={step.label} className="flex items-start space-x-3.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-[#23201D] text-[#FAF7F2]'
                      : isCurrent
                      ? 'bg-[#AA9B87] text-[#FAF7F2] ring-2 ring-[#E8E0D2]'
                      : 'bg-[#FAF7F2] border border-[#E8E0D2] text-[#AA9B87]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 bg-[#FAF7F2] rounded-full" />
                  ) : (
                    <Circle className="w-2.5 h-2.5 stroke-[1.5]" />
                  )}
                </div>
                <div className="flex-1 pb-2 border-b border-[#F5EFE6]">
                  <span
                    className={`text-xs font-sans tracking-wider uppercase font-medium block ${
                      isCurrent || isCompleted ? 'text-[#23201D]' : 'text-[#7A746C]'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[11px] text-[#7A746C] block mt-0.5">
                    {step.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipment Details Metadata Grid */}
      <div className="bg-[#FAF7F2] border border-[#E8E0D2] p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
            Courier Partner
          </span>
          <span className="font-medium text-[#23201D] mt-1 block">
            {courierName || 'White-Glove Surface'}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
            AWB Tracking Number
          </span>
          <span className="font-mono text-[11px] text-[#23201D] mt-1 block font-medium">
            {awb || 'Assigned in transit'}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
            Est. Delivery
          </span>
          <span className="font-medium text-[#23201D] mt-1 block">
            {estimatedDelivery || '4-7 business days'}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#7A746C] block">
            Latest Transit Scan
          </span>
          <span className="text-[#23201D] mt-1 block text-[11px]">
            {latestUpdate || 'Jaipur Atelier Hub'}
          </span>
        </div>
      </div>

      {/* Detailed Activity Scans Timeline if present */}
      {scans && scans.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#F2ECE1]">
          <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#AA9B87] block mb-3 font-medium">
            Recent Transit Scans
          </span>
          <div className="space-y-3">
            {scans.map((scan, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs">
                <Clock className="w-3.5 h-3.5 text-[#AA9B87] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[#23201D] font-medium block">{scan.activity}</span>
                  <span className="text-[11px] text-[#7A746C]">
                    {scan.location ? `${scan.location} · ` : ''}
                    {scan.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carrier Deep Link */}
      {trackingUrl && (
        <div className="mt-5 text-right">
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-[#23201D] hover:text-[#AA9B87] uppercase tracking-[0.18em] transition-colors"
          >
            <span>Open Carrier Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}

function isDeliveredStatus(status: string) {
  return status === 'delivered';
}
