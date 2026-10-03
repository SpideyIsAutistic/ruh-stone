import { Order } from '@/types';

interface ShiprocketTokenCache {
  token: string;
  expiresAt: number;
}

let cachedAuth: ShiprocketTokenCache | null = null;

export function getShiprocketConfig() {
  const email = process.env.SHIPROCKET_EMAIL || '';
  const password = process.env.SHIPROCKET_PASSWORD || '';
  const isConfigured = Boolean(email) && Boolean(password);
  return { email, password, isConfigured };
}

/**
 * Authenticates with Shiprocket and caches bearer token.
 */
export async function getShiprocketToken(): Promise<string | null> {
  const { email, password, isConfigured } = getShiprocketConfig();
  if (!isConfigured) {
    console.log('[Shiprocket] Credentials not configured. Operating in simulation mode.');
    return null;
  }

  // Check cache (refresh 1 hour before expiry)
  const now = Date.now();
  if (cachedAuth && cachedAuth.expiresAt > now + 3600 * 1000) {
    return cachedAuth.token;
  }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Shiprocket Auth Error]', res.status, err);
      return null;
    }

    const data = await res.json();
    if (data.token) {
      cachedAuth = {
        token: data.token,
        // Shiprocket tokens last ~10 days; cache for 7 days
        expiresAt: now + 7 * 24 * 3600 * 1000,
      };
      return data.token;
    }
    return null;
  } catch (error) {
    console.error('[Shiprocket Auth Exception]', error);
    return null;
  }
}

export interface CreateShiprocketOrderResult {
  success: boolean;
  orderId?: number | string;
  shipmentId?: number | string;
  awbCode?: string;
  courierName?: string;
  error?: string;
}

/**
 * Creates a Shiprocket order safely.
 * Will not throw or fail the parent order if Shiprocket is unreachable.
 */
export async function createShiprocketOrder(
  order: Order
): Promise<CreateShiprocketOrderResult> {
  try {
    const token = await getShiprocketToken();
    if (!token) {
      // In simulation mode, generate a mock tracking payload
      return {
        success: true,
        orderId: `SR-SIM-${Date.now()}`,
        shipmentId: `SHP-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        awbCode: `AWB${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        courierName: 'BlueDart Express / Delhivery Surface',
      };
    }

    const orderDate = new Date(order.createdAt)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    const orderItems = order.items.map((item) => ({
      name: item.name,
      sku: `RUH-${item.productId}`,
      units: item.quantity,
      selling_price: item.priceNumeric,
      discount: 0,
      tax: 0,
    }));

    const payload = {
      order_id: order.id,
      order_date: orderDate,
      pickup_location: 'Primary Atelier',
      billing_customer_name: order.customer.name,
      billing_last_name: '',
      billing_address: order.customer.address,
      billing_city: order.customer.city,
      billing_pincode: order.customer.pincode,
      billing_state: order.customer.state || 'Rajasthan',
      billing_country: order.customer.country || 'India',
      billing_email: order.customer.email,
      billing_phone: order.customer.phone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: 'Prepaid',
      sub_total: order.subtotal,
      length: 25,
      breadth: 20,
      height: 15,
      weight: 1.5,
    };

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Shiprocket Order Creation Error]', res.status, err);
      return { success: false, error: err };
    }

    const data = await res.json();
    return {
      success: true,
      orderId: data.order_id,
      shipmentId: data.shipment_id,
      awbCode: data.awb_code || undefined,
      courierName: data.courier_name || undefined,
    };
  } catch (error: any) {
    console.error('[Shiprocket Order Exception]', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Fetches real-time tracking for an AWB or Shipment ID.
 */
export async function getShiprocketTracking(awbOrShipmentId: string) {
  try {
    const token = await getShiprocketToken();
    if (!token) {
      // Mock tracking info in simulation mode
      return {
        status: 'In Transit',
        current_status: 'Artisan piece dispatched from atelier — carefully boxed with protective archival crating.',
        estimated_delivery: new Date(Date.now() + 4 * 24 * 3600 * 1000).toLocaleDateString(
          'en-IN',
          { day: 'numeric', month: 'short', year: 'numeric' }
        ),
        scans: [
          {
            date: new Date().toLocaleDateString('en-IN'),
            activity: 'Package received at Hub & Inspected for Transit',
            location: 'Jaipur Atelier Hub',
          },
          {
            date: new Date().toLocaleDateString('en-IN'),
            activity: 'Air Waybill Assigned',
            location: 'Jaipur',
          },
        ],
      };
    }

    const res = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbOrShipmentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[Shiprocket Tracking Exception]', error);
    return null;
  }
}
