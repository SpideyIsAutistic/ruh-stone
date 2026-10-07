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

import { getPgPool, getDatabaseConfig, initDatabase } from '@/lib/db';

/**
 * Normalizes Shiprocket status to application tracking status
 */
export function normalizeShipmentStatus(rawStatus?: string): string {
  if (!rawStatus) return 'pending';
  const s = rawStatus.toLowerCase();
  if (s.includes('deliver') && !s.includes('out')) return 'delivered';
  if (s.includes('out for delivery') || s.includes('out_for_delivery') || s.includes('reached destination')) return 'out_for_delivery';
  if (s.includes('in transit') || s.includes('in_transit') || s.includes('transit') || s.includes('dispatched')) return 'in_transit';
  if (s.includes('shipped') || s.includes('pickup scheduled') || s.includes('picked up')) return 'shipped';
  if (s.includes('packed') || s.includes('manifest') || s.includes('ready to ship')) return 'packed';
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('return') || s.includes('rto')) return 'returned';
  if (s.includes('exception') || s.includes('ndr') || s.includes('undelivered') || s.includes('delay')) return 'exception';
  return 'in_transit';
}

/**
 * Fetches tracking for an AWB or Shipment ID with DB caching.
 */
export async function getShiprocketTracking(
  awbOrShipmentId: string,
  options?: { forceRefresh?: boolean; orderId?: string }
) {
  const forceRefresh = options?.forceRefresh ?? false;
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  // 1. Check cached shipment in database if not forced
  if (isPostgres && pool && !forceRefresh) {
    try {
      await initDatabase();
      const res = await pool.query(
        `SELECT id, order_id, shiprocket_order_id, awb, courier_name, status,
                tracking_url, estimated_delivery, last_tracking_update, raw_tracking_data
         FROM shipments
         WHERE awb = $1 OR shiprocket_order_id = $1 OR order_id = $2
         ORDER BY updated_at DESC LIMIT 1`,
        [awbOrShipmentId, options?.orderId || awbOrShipmentId]
      );

      if (res.rows.length > 0) {
        const row = res.rows[0];
        const lastUpdate = row.last_tracking_update ? new Date(row.last_tracking_update).getTime() : 0;
        const isFresh = Date.now() - lastUpdate < 15 * 60 * 1000; // 15 mins cache

        if (isFresh && row.raw_tracking_data) {
          const raw = typeof row.raw_tracking_data === 'string' ? JSON.parse(row.raw_tracking_data) : row.raw_tracking_data;
          return {
            ...raw,
            cached: true,
            status: row.status,
            awb: row.awb,
            courier_name: row.courier_name,
            estimated_delivery: row.estimated_delivery
              ? new Date(row.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : raw.estimated_delivery,
            last_updated: row.last_tracking_update,
          };
        }
      }
    } catch (cacheErr) {
      console.warn('[Shiprocket] Cache read warning:', cacheErr);
    }
  }

  try {
    const token = await getShiprocketToken();
    let trackingResult: any = null;

    if (!token) {
      // Mock tracking info in simulation mode
      trackingResult = {
        status: 'In Transit',
        current_status: 'Artisan piece dispatched from atelier — carefully boxed with protective archival crating.',
        estimated_delivery: new Date(Date.now() + 4 * 24 * 3600 * 1000).toLocaleDateString(
          'en-IN',
          { day: 'numeric', month: 'short', year: 'numeric' }
        ),
        courier_name: 'BlueDart Express / Delhivery Surface',
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
    } else {
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

      if (res.ok) {
        trackingResult = await res.json();
      }
    }

    if (trackingResult) {
      const normalizedStatus = normalizeShipmentStatus(
        trackingResult.current_status || trackingResult.status || trackingResult.tracking_data?.track_status
      );

      // Cache into shipments table
      if (isPostgres && pool) {
        try {
          await initDatabase();
          await pool.query(
            `UPDATE shipments SET
               status = $1,
               courier_name = COALESCE($2, courier_name),
               raw_tracking_data = $3,
               last_tracking_update = NOW(),
               updated_at = NOW()
             WHERE awb = $4 OR shiprocket_order_id = $4 OR order_id = $5`,
            [
              normalizedStatus,
              trackingResult.courier_name || null,
              JSON.stringify(trackingResult),
              awbOrShipmentId,
              options?.orderId || awbOrShipmentId,
            ]
          );
        } catch (dbErr) {
          console.warn('[Shiprocket] Failed to update cache in shipments table:', dbErr);
        }
      }

      return {
        ...trackingResult,
        normalizedStatus,
        last_updated: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error('[Shiprocket Tracking Exception]', error);
    return null;
  }
}

