import crypto from 'crypto';

export interface RazorpayOrderOptions {
  amountInPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export function getRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  const isConfigured =
    Boolean(keyId) &&
    Boolean(keySecret) &&
    !keyId.includes('placeholder') &&
    !keySecret.includes('placeholder');

  return { keyId, keySecret, webhookSecret, isConfigured };
}

/**
 * Creates a Razorpay order on Razorpay's API server-side.
 * Falls back to an authenticated test simulation if keys are dummy placeholders.
 */
export async function createRazorpayOrder(
  options: RazorpayOrderOptions
): Promise<RazorpayOrderResponse> {
  const { keyId, keySecret, isConfigured } = getRazorpayKeys();

  if (isConfigured) {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: options.amountInPaise,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes || {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay API error:', errorText);
      throw new Error(`Razorpay order creation failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  // Simulation mode for initial setup / local sandbox before live/test credentials are injected
  console.log('[Razorpay Test Mode] Generating simulation order for:', options.receipt);
  return {
    id: `order_sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    amount: options.amountInPaise,
    currency: options.currency || 'INR',
    receipt: options.receipt,
    status: 'created',
  };
}

/**
 * Server-side payment verification using HMAC-SHA256 signature calculation.
 */
export function verifyRazorpayPayment(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { orderId, paymentId, signature } = params;
  const { keySecret, isConfigured } = getRazorpayKeys();

  if (!isConfigured) {
    // In simulation mode, accept simulation signatures
    if (orderId.startsWith('order_sim_') || signature.startsWith('sim_sig_') || signature === 'test_verified') {
      return true;
    }
    // Still test HMAC calculation if secret provided
    if (!keySecret) return true;
  }

  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error('Error verifying Razorpay payment signature:', error);
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature using RAZORPAY_WEBHOOK_SECRET.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  webhookSignature: string
): boolean {
  const { webhookSecret } = getRazorpayKeys();
  if (!webhookSecret) {
    console.warn('RAZORPAY_WEBHOOK_SECRET is not configured; rejecting webhook validation');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(webhookSignature, 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error('Error validating Razorpay webhook signature:', error);
    return false;
  }
}
