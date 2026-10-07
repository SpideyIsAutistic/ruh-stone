import { getPgPool, getDatabaseConfig, initDatabase } from '@/lib/db';
import { CustomerProfile, Address, Order, ShipmentRecord, WishlistItem } from '@/types';
import { dbGetProductById } from '@/lib/db';

/**
 * PROFILES
 */
export async function getProfile(userId: string): Promise<CustomerProfile | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return null;

  await initDatabase();
  const res = await pool.query(
    'SELECT id, user_id, full_name, phone, avatar_url, created_at, updated_at FROM profiles WHERE user_id = $1 LIMIT 1',
    [userId]
  );

  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertProfile(
  userId: string,
  data: { fullName?: string; phone?: string; avatarUrl?: string }
): Promise<CustomerProfile | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return null;

  await initDatabase();
  const res = await pool.query(
    `INSERT INTO profiles (user_id, full_name, phone, avatar_url, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       full_name = COALESCE($2, profiles.full_name),
       phone = COALESCE($3, profiles.phone),
       avatar_url = COALESCE($4, profiles.avatar_url),
       updated_at = NOW()
     RETURNING id, user_id, full_name, phone, avatar_url, created_at, updated_at`,
    [userId, data.fullName || '', data.phone || '', data.avatarUrl || '']
  );

  const row = res.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * ADDRESSES
 */
export async function getAddresses(userId: string): Promise<Address[]> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return [];

  await initDatabase();
  const res = await pool.query(
    `SELECT id, user_id, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, created_at, updated_at
     FROM addresses
     WHERE user_id = $1
     ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );

  return res.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2 || '',
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createAddress(
  userId: string,
  data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Address | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return null;

  await initDatabase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // If marked default, unset existing default addresses
    if (data.isDefault) {
      await client.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    } else {
      // If this is the user's first address, make it default automatically
      const countRes = await client.query('SELECT count(*) FROM addresses WHERE user_id = $1', [userId]);
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        data.isDefault = true;
      }
    }

    const res = await client.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, user_id, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, created_at, updated_at`,
      [
        userId,
        data.fullName,
        data.phone,
        data.addressLine1,
        data.addressLine2 || null,
        data.city,
        data.state,
        data.postalCode,
        data.country || 'India',
        Boolean(data.isDefault),
      ]
    );

    await client.query('COMMIT');
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      fullName: row.full_name,
      phone: row.phone,
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2 || '',
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: Partial<Address>
): Promise<Address | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return null;

  await initDatabase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (data.isDefault) {
      await client.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    }

    const res = await client.query(
      `UPDATE addresses SET
         full_name = COALESCE($1, full_name),
         phone = COALESCE($2, phone),
         address_line_1 = COALESCE($3, address_line_1),
         address_line_2 = COALESCE($4, address_line_2),
         city = COALESCE($5, city),
         state = COALESCE($6, state),
         postal_code = COALESCE($7, postal_code),
         country = COALESCE($8, country),
         is_default = COALESCE($9, is_default),
         updated_at = NOW()
       WHERE id = $10 AND user_id = $11
       RETURNING id, user_id, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, created_at, updated_at`,
      [
        data.fullName,
        data.phone,
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.state,
        data.postalCode,
        data.country,
        data.isDefault,
        addressId,
        userId,
      ]
    );

    await client.query('COMMIT');
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      fullName: row.full_name,
      phone: row.phone,
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2 || '',
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteAddress(userId: string, addressId: string): Promise<boolean> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return false;

  await initDatabase();
  const res = await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [
    addressId,
    userId,
  ]);
  return (res.rowCount ?? 0) > 0;
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return false;

  await initDatabase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    const res = await client.query(
      'UPDATE addresses SET is_default = TRUE, updated_at = NOW() WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );
    await client.query('COMMIT');
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * ORDERS FOR AUTHENTICATED PATRON
 */
export async function getCustomerOrders(userId: string): Promise<Order[]> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return [];

  await initDatabase();
  const res = await pool.query(
    `SELECT raw_data, user_id, order_number, order_status, status, payment_status, total, created_at
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return res.rows.map((r) => {
    const raw = typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data;
    return {
      ...raw,
      userId: r.user_id,
      orderNumber: r.order_number || raw.id,
      orderStatus: r.order_status || raw.orderStatus,
      paymentStatus: r.payment_status || raw.paymentStatus,
    };
  });
}

export async function getCustomerOrderById(userId: string, orderId: string): Promise<Order | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return null;

  await initDatabase();
  const res = await pool.query(
    `SELECT raw_data, user_id, order_number, order_status, status, payment_status
     FROM orders
     WHERE (id = $1 OR order_number = $1) AND user_id = $2
     LIMIT 1`,
    [orderId, userId]
  );

  if (res.rows.length === 0) return null;
  const raw = typeof res.rows[0].raw_data === 'string' ? JSON.parse(res.rows[0].raw_data) : res.rows[0].raw_data;
  return {
    ...raw,
    userId: res.rows[0].user_id,
    orderNumber: res.rows[0].order_number || raw.id,
    orderStatus: res.rows[0].order_status || raw.orderStatus,
    paymentStatus: res.rows[0].payment_status || raw.paymentStatus,
  };
}

export async function getCustomerOrderStats(
  userId: string
): Promise<{ total: number; active: number; completed: number }> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return { total: 0, active: 0, completed: 0 };

  await initDatabase();
  const res = await pool.query(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE order_status IN ('confirmed', 'processing', 'shipped') OR status IN ('confirmed', 'processing', 'shipped')) as active,
       COUNT(*) FILTER (WHERE order_status = 'delivered' OR status = 'delivered') as completed
     FROM orders
     WHERE user_id = $1`,
    [userId]
  );

  const row = res.rows[0];
  return {
    total: parseInt(row.total || '0', 10),
    active: parseInt(row.active || '0', 10),
    completed: parseInt(row.completed || '0', 10),
  };
}

/**
 * PUBLIC ORDER TRACKING VERIFICATION
 * Only returns order if order_number / id matches AND customer email or phone matches!
 */
export async function verifyAndGetOrder(
  orderNumberOrId: string,
  emailOrPhone: string
): Promise<Order | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return null;

  await initDatabase();
  const cleanedQuery = orderNumberOrId.trim();
  const cleanedContact = emailOrPhone.trim().toLowerCase();

  const res = await pool.query(
    `SELECT raw_data, customer_email, customer_phone
     FROM orders
     WHERE (LOWER(id) = LOWER($1) OR LOWER(order_number) = LOWER($1))
       AND (
         LOWER(customer_email) = $2
         OR LOWER(REPLACE(COALESCE(customer_phone, ''), ' ', '')) = LOWER(REPLACE($2, ' ', ''))
         OR RIGHT(REPLACE(COALESCE(customer_phone, ''), ' ', ''), 10) = RIGHT(REPLACE($2, ' ', ''), 10)
       )
     LIMIT 1`,
    [cleanedQuery, cleanedContact]
  );

  if (res.rows.length === 0) return null;
  const raw = typeof res.rows[0].raw_data === 'string' ? JSON.parse(res.rows[0].raw_data) : res.rows[0].raw_data;
  return raw;
}

/**
 * SHIPMENTS
 */
export async function getShipmentByOrderId(orderId: string): Promise<ShipmentRecord | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return null;

  await initDatabase();
  const res = await pool.query(
    `SELECT id, order_id, shiprocket_order_id, awb, courier_name, status, tracking_url, estimated_delivery, last_tracking_update, raw_tracking_data, created_at, updated_at
     FROM shipments
     WHERE order_id = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
    [orderId]
  );

  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  return {
    id: r.id,
    orderId: r.order_id,
    shiprocketOrderId: r.shiprocket_order_id,
    awb: r.awb,
    courierName: r.courier_name,
    status: r.status,
    trackingUrl: r.tracking_url,
    estimatedDelivery: r.estimated_delivery,
    lastTrackingUpdate: r.last_tracking_update,
    rawTrackingData: r.raw_tracking_data,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function upsertShipment(
  data: Partial<ShipmentRecord> & { orderId: string }
): Promise<ShipmentRecord | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return null;

  await initDatabase();
  const res = await pool.query(
    `INSERT INTO shipments (
       order_id, shiprocket_order_id, awb, courier_name, status,
       tracking_url, estimated_delivery, last_tracking_update, raw_tracking_data, created_at, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
     RETURNING id, order_id, shiprocket_order_id, awb, courier_name, status, tracking_url, estimated_delivery, last_tracking_update, raw_tracking_data, created_at, updated_at`,
    [
      data.orderId,
      data.shiprocketOrderId || null,
      data.awb || null,
      data.courierName || 'BlueDart Express / Delhivery',
      data.status || 'manifest_generated',
      data.trackingUrl || null,
      data.estimatedDelivery ? new Date(data.estimatedDelivery).toISOString() : null,
      data.lastTrackingUpdate ? new Date(data.lastTrackingUpdate).toISOString() : new Date().toISOString(),
      data.rawTrackingData ? JSON.stringify(data.rawTrackingData) : null,
    ]
  );

  const r = res.rows[0];
  return {
    id: r.id,
    orderId: r.order_id,
    shiprocketOrderId: r.shiprocket_order_id,
    awb: r.awb,
    courierName: r.courier_name,
    status: r.status,
    trackingUrl: r.tracking_url,
    estimatedDelivery: r.estimated_delivery,
    lastTrackingUpdate: r.last_tracking_update,
    rawTrackingData: r.raw_tracking_data,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * WISHLIST
 */
export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return [];

  await initDatabase();
  const res = await pool.query(
    'SELECT id, user_id, product_id, created_at FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  const items: WishlistItem[] = [];
  for (const r of res.rows) {
    const product = await dbGetProductById(r.product_id);
    items.push({
      id: r.id,
      userId: r.user_id,
      productId: r.product_id,
      product: product || undefined,
      createdAt: r.created_at,
    });
  }
  return items;
}

export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return false;

  await initDatabase();
  const res = await pool.query(
    'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING RETURNING id',
    [userId, productId]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  if (!isPostgres || !pool) return false;

  await initDatabase();
  const res = await pool.query('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [
    userId,
    productId,
  ]);
  return (res.rowCount ?? 0) > 0;
}
