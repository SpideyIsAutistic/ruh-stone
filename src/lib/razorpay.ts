import crypto from 'crypto';
import Razorpay from 'razorpay';

export interface RazorpayOrderOptions {
  amountInPaise: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

export function getRazorpayKeys() {
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  const isConfigured =
    Boolean(keyId) &&
    Boolean(keySecret) &&
    !keyId.includes('placeholder') &&
    !keySecret.includes('placeholder');

  return { keyId, keySecret, webhookSecret, isConfigured };
}

let razorpayClient: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  const { keyId, keySecret } = getRazorpayKeys();
  if (!keyId || !keySecret) {
    const error: any = new Error('Authentication failed. Razorpay credentials are not configured.');
    error.statusCode = 401;
    throw error;
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayClient;
}

/**
 * Creates a Razorpay order on Razorpay API server-side.
 * Uses HTTP Basic Authentication with credentials over HTTPS.
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
        amount: Math.round(options.amountInPaise),
        currency: options.currency || 'INR',
        receipt: (options.receipt || `rcpt_${Date.now()}`).slice(0, 40),
        notes: options.notes || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const err: any = new Error(
        data?.error?.description || `Razorpay order creation failed with status ${response.status}`
      );
      err.statusCode = response.status;
      err.error = data?.error;
      throw err;
    }

    return {
      id: data.id,
      amount: Number(data.amount),
      currency: data.currency,
      receipt: (data.receipt as string) || options.receipt || '',
      status: data.status,
    };
  }

  // Simulation mode fallback for offline local testing
  console.log('[Razorpay Test Mode] Generating simulation order for:', options.receipt);
  return {
    id: `order_sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    amount: options.amountInPaise,
    currency: options.currency || 'INR',
    receipt: options.receipt || '',
    status: 'created',
  };
}

/**
 * Server-side payment verification using HMAC-SHA256 signature calculation.
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
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
    if (
      orderId.startsWith('order_sim_') ||
      signature.startsWith('sim_sig_') ||
      signature === 'test_verified'
    ) {
      return true;
    }
    if (!keySecret) return false;
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
