'use client';

import React, { useState } from 'react';
import OrderTrackingTimeline from '@/components/OrderTrackingTimeline';

interface OrderTrackingClientWrapperProps {
  orderId: string;
  initialOrderStatus: string;
  initialPaymentStatus: string;
  initialCourier?: string;
  initialAwb?: string;
  initialTrackingUrl?: string;
  initialTracking?: any;
}

export default function OrderTrackingClientWrapper({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
  initialCourier,
  initialAwb,
  initialTrackingUrl,
  initialTracking,
}: OrderTrackingClientWrapperProps) {
  const [tracking, setTracking] = useState(initialTracking);
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [courier, setCourier] = useState(initialCourier);
  const [awb, setAwb] = useState(initialAwb);
  const [trackingUrl, setTrackingUrl] = useState(initialTrackingUrl);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/track?refresh=true`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrderStatus(data.order.orderStatus);
        setCourier(data.order.shiprocketCourier || courier);
        setAwb(data.order.shiprocketAWB || awb);
        setTrackingUrl(data.order.trackingUrl || trackingUrl);
        setTracking(data.tracking);
      }
    } catch (err) {
      console.error('Refresh tracking error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const estimated =
    tracking?.estimated_delivery ||
    tracking?.tracking_data?.etd ||
    '4-7 business days';

  const latestScan =
    tracking?.current_status ||
    tracking?.scans?.[0]?.activity ||
    tracking?.tracking_data?.track_status ||
    'Processing in atelier';

  return (
    <OrderTrackingTimeline
      orderStatus={orderStatus}
      paymentStatus={initialPaymentStatus}
      courierName={courier}
      awb={awb}
      trackingUrl={trackingUrl}
      estimatedDelivery={estimated}
      latestUpdate={latestScan}
      scans={tracking?.scans}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
}
