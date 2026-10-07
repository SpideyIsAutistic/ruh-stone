import fs from 'fs';
import path from 'path';
import { Order, PaymentStatus, OrderStatus } from '@/types';
import { getDatabaseConfig, getPgPool, initDatabase } from '@/lib/db';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

function ensureDataFile() {
  try {
    const dir = path.dirname(ordersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(ordersFilePath)) {
      fs.writeFileSync(ordersFilePath, '[]', 'utf8');
    }
  } catch (error) {
    // Non-fatal
  }
}

async function getJsonOrders(): Promise<Order[]> {
  ensureDataFile();
  try {
    const fileContent = fs.readFileSync(ordersFilePath, 'utf8');
    const orders: Order[] = JSON.parse(fileContent || '[]');
    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

async function saveJsonOrders(orders: Order[]): Promise<boolean> {
  ensureDataFile();
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export function generateOrderId(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `RUH-2026-${randomSuffix}`;
}

export async function getAllOrders(): Promise<Order[]> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    await initDatabase();
    const res = await pool.query('SELECT raw_data FROM orders ORDER BY created_at DESC');
    return res.rows.map((r) =>
      typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data
    );
  }

  return getJsonOrders();
}

export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  const now = new Date().toISOString();
  const id = generateOrderId();

  const newOrder: Order = {
    ...data,
    id,
    orderNumber: data.orderNumber || id,
    status: data.status || data.orderStatus || 'pending',
    shippingAmount: data.shippingAmount ?? data.shipping ?? 0,
    discountAmount: data.discountAmount ?? 0,
    totalAmount: data.totalAmount ?? data.total,
    createdAt: now,
    updatedAt: now,
  };

  if (isPostgres && pool) {
    await initDatabase();
    await pool.query(
      `INSERT INTO orders (
        id, user_id, order_number, customer_name, customer_email, customer_phone, customer_address,
        shipping_address, billing_address, items, subtotal, shipping, shipping_amount,
        discount_amount, total, total_amount, currency, payment_status, order_status, status,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        shiprocket_order_id, shiprocket_shipment_id, shiprocket_awb_code,
        tracking_url, raw_data, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)`,
      [
        newOrder.id,
        newOrder.userId || null,
        newOrder.orderNumber,
        newOrder.customer.name,
        newOrder.customer.email,
        newOrder.customer.phone,
        JSON.stringify(newOrder.customer),
        JSON.stringify(newOrder.shippingAddress || newOrder.customer),
        JSON.stringify(newOrder.billingAddress || newOrder.customer),
        JSON.stringify(newOrder.items),
        newOrder.subtotal,
        newOrder.shipping || 0,
        newOrder.shippingAmount || 0,
        newOrder.discountAmount || 0,
        newOrder.total,
        newOrder.totalAmount || newOrder.total,
        newOrder.currency || 'INR',
        newOrder.paymentStatus || 'pending',
        newOrder.orderStatus || 'pending',
        newOrder.status || 'pending',
        newOrder.razorpayOrderId || null,
        newOrder.razorpayPaymentId || null,
        newOrder.razorpaySignature || null,
        newOrder.shiprocketOrderId || null,
        newOrder.shiprocketShipmentId || null,
        newOrder.shiprocketAWB || null,
        newOrder.shiprocketTrackingUrl || null,
        JSON.stringify(newOrder),
        newOrder.createdAt,
        newOrder.updatedAt,
      ]
    );

    // Insert normalized order items
    if (newOrder.items && Array.isArray(newOrder.items)) {
      for (const item of newOrder.items) {
        try {
          await pool.query(
            `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              newOrder.id,
              item.productId || 'item',
              item.name || 'Handcrafted Piece',
              item.heroImage || null,
              item.quantity || 1,
              item.priceNumeric || 0,
              (item.priceNumeric || 0) * (item.quantity || 1),
            ]
          );
        } catch (itemErr) {
          console.warn('[DB] Non-fatal order_items insert warning:', itemErr);
        }
      }
    }

    // Sync backup to JSON
    const jsonOrders = await getJsonOrders();
    jsonOrders.unshift(newOrder);
    await saveJsonOrders(jsonOrders);

    return newOrder;
  }

  const orders = await getJsonOrders();
  orders.unshift(newOrder);
  await saveJsonOrders(orders);
  return newOrder;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    await initDatabase();
    const res = await pool.query('SELECT raw_data FROM orders WHERE id = $1 LIMIT 1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data;
  }

  const orders = await getJsonOrders();
  return orders.find((o) => o.id === id) || null;
}

export async function getOrderByRazorpayOrderId(rzpOrderId: string): Promise<Order | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    await initDatabase();
    const res = await pool.query(
      'SELECT raw_data FROM orders WHERE razorpay_order_id = $1 LIMIT 1',
      [rzpOrderId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data;
  }

  const orders = await getJsonOrders();
  return orders.find((o) => o.razorpayOrderId === rzpOrderId) || null;
}

export async function updateOrderPayment(
  orderId: string,
  paymentData: {
    paymentId: string;
    signature?: string;
    status: PaymentStatus;
  }
): Promise<Order | null> {
  const existing = await getOrderById(orderId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Order = {
    ...existing,
    paymentStatus: paymentData.status,
    orderStatus: paymentData.status === 'paid' ? 'confirmed' : existing.orderStatus,
    razorpayPaymentId: paymentData.paymentId,
    razorpaySignature: paymentData.signature || existing.razorpaySignature,
    updatedAt: now,
  };

  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    await initDatabase();
    await pool.query(
      `UPDATE orders SET
        payment_status = $1,
        order_status = $2,
        razorpay_payment_id = $3,
        razorpay_signature = $4,
        raw_data = $5,
        updated_at = NOW()
      WHERE id = $6`,
      [
        updated.paymentStatus,
        updated.orderStatus,
        updated.razorpayPaymentId,
        updated.razorpaySignature,
        JSON.stringify(updated),
        orderId,
      ]
    );
  }

  const orders = await getJsonOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx > -1) {
    orders[idx] = updated;
    await saveJsonOrders(orders);
  }

  return updated;
}

export async function updateOrderShipping(
  orderId: string,
  shippingData: {
    orderStatus?: OrderStatus;
    shiprocketOrderId?: number | string;
    shiprocketShipmentId?: number | string;
    shiprocketAWB?: string;
    shiprocketCourier?: string;
    shiprocketTrackingUrl?: string;
  }
): Promise<Order | null> {
  const existing = await getOrderById(orderId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Order = {
    ...existing,
    ...shippingData,
    updatedAt: now,
  };

  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    await initDatabase();
    await pool.query(
      `UPDATE orders SET
        order_status = $1,
        shiprocket_order_id = $2,
        shiprocket_shipment_id = $3,
        shiprocket_awb_code = $4,
        tracking_url = $5,
        raw_data = $6,
        updated_at = NOW()
      WHERE id = $7`,
      [
        updated.orderStatus,
        updated.shiprocketOrderId?.toString() || null,
        updated.shiprocketShipmentId?.toString() || null,
        updated.shiprocketAWB || null,
        updated.shiprocketTrackingUrl || null,
        JSON.stringify(updated),
        orderId,
      ]
    );

    // Also persist into shipments table
    if (updated.shiprocketOrderId || updated.shiprocketAWB) {
      try {
        await pool.query(
          `INSERT INTO shipments (
             order_id, shiprocket_order_id, awb, courier_name, status,
             tracking_url, last_tracking_update, created_at, updated_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [
            orderId,
            updated.shiprocketOrderId?.toString() || null,
            updated.shiprocketAWB || null,
            updated.shiprocketCourier || 'BlueDart Express / Delhivery',
            updated.orderStatus === 'shipped' ? 'shipped' : 'manifest_generated',
            updated.shiprocketTrackingUrl || null,
          ]
        );
      } catch (shipmentErr) {
        console.warn('[DB] Non-fatal shipments table insert warning:', shipmentErr);
      }
    }
  }

  const orders = await getJsonOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx > -1) {
    orders[idx] = updated;
    await saveJsonOrders(orders);
  }

  return updated;
}

export async function associateOrderWithUser(
  orderId: string,
  userId: string
): Promise<Order | null> {
  const existing = await getOrderById(orderId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Order = {
    ...existing,
    userId,
    updatedAt: now,
  };

  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    await initDatabase();
    await pool.query(
      `UPDATE orders SET
        user_id = $1,
        raw_data = $2,
        updated_at = NOW()
      WHERE id = $3`,
      [userId, JSON.stringify(updated), orderId]
    );
  }

  const orders = await getJsonOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx > -1) {
    orders[idx] = updated;
    await saveJsonOrders(orders);
  }

  return updated;
}

