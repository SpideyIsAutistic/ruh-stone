'use client';

import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutButtonProps {
  amount?: number; // In paise (e.g. 50000 = ₹500)
  currency?: string;
  receipt?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  buttonText?: string;
  className?: string;
  onSuccess?: (paymentResult: {
    order_id: string;
    payment_id: string;
    signature: string;
  }) => void;
  onError?: (errorMessage: string) => void;
}

export default function RazorpayCheckoutButton({
  amount = 50000,
  currency = 'INR',
  receipt,
  name = 'RUH STONE',
  description = 'Handcrafted Artisanal Stone & Metal Objects',
  prefill,
  buttonText = 'Pay with Razorpay',
  className = '',
  onSuccess,
  onError,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Razorpay Standard Checkout SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const loadScriptIfNeeded = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      // Ensure SDK script is loaded
      const scriptLoaded = await loadScriptIfNeeded();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 1. Call Backend to Create Razorpay Order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.order_id) {
        throw new Error(orderData.error || 'Failed to initialize Razorpay order');
      }

      const keyId =
        orderData.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        'rzp_test_TjTlWcIAYsZ2hY';

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name,
        description,
        image: '/icon.png',
        order_id: orderData.order_id,
        prefill: {
          name: prefill?.name || '',
          email: prefill?.email || '',
          contact: prefill?.contact || '',
        },
        theme: {
          color: '#23201D',
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 3. Send payment ID, order ID, and signature to backend verification endpoint
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setLoading(false);
              if (onSuccess) {
                onSuccess({
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                });
              }
            } else {
              const errMsg = verifyData.error || 'Signature verification failed';
              setErrorMessage(errMsg);
              setLoading(false);
              if (onError) onError(errMsg);
            }
          } catch (err: any) {
            const errMsg = err?.message || 'Verification network error';
            setErrorMessage(errMsg);
            setLoading(false);
            if (onError) onError(errMsg);
          }
        },
        modal: {
          ondismiss: function () {
            // User cancelled / dismissed modal
            setLoading(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);

      // Handle payment.failed event
      rzpInstance.on('payment.failed', function (resp: any) {
        const failureMsg = resp.error?.description || 'Payment was unsuccessful or declined.';
        setErrorMessage(failureMsg);
        setLoading(false);
        if (onError) onError(failureMsg);
      });

      rzpInstance.open();
    } catch (err: any) {
      const msg = err?.message || 'An error occurred during payment initiation';
      setErrorMessage(msg);
      setLoading(false);
      if (onError) onError(msg);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {errorMessage && (
        <div className="p-3 bg-[#8B3A2B]/10 border border-[#8B3A2B]/30 text-[#8B3A2B] text-xs">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ||
          'w-full bg-[#23201D] text-[#FAF7F2] py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-[#3D3731] transition-colors disabled:opacity-50 cursor-pointer'
        }
      >
        {loading ? 'INITIALIZING CHECKOUT...' : buttonText}
      </button>
    </div>
  );
}
