import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { CRAFT_PRODUCTS } from '../src/data/craftData';
import { CraftProduct, Order, AbandonedCartSession } from '../src/types';

// Load .env or .env.local
const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

function loadEnv(file: string) {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv(envLocalPath);
loadEnv(envPath);

const databaseUrl =
  process.env.DATABASE_URL || 'postgresql://spidey@localhost:5432/ruh_stone';

console.log('[MIGRATION] Connecting to PostgreSQL at:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
const sanitizedUrl = databaseUrl.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?$/, '');

const pool = new Pool({
  connectionString: sanitizedUrl,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('[MIGRATION] Applying database schema...');
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'src/lib/schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('[MIGRATION] ✓ Schema applied successfully.');

    // 1. Seed Products
    console.log('[MIGRATION] Checking products table...');
    const customDataFilePath = path.join(process.cwd(), 'src/data/customProducts.json');
    let customList: CraftProduct[] = [];
    if (fs.existsSync(customDataFilePath)) {
      try {
        customList = JSON.parse(fs.readFileSync(customDataFilePath, 'utf8') || '[]');
      } catch (e) {
        console.warn('Could not parse customProducts.json:', e);
      }
    }

    const deletedDataFilePath = path.join(process.cwd(), 'src/data/deletedProductIds.json');
    let deletedIds = new Set<string>();
    if (fs.existsSync(deletedDataFilePath)) {
      try {
        const deleted: string[] = JSON.parse(fs.readFileSync(deletedDataFilePath, 'utf8') || '[]');
        deletedIds = new Set(deleted);
      } catch (e) {
        console.warn('Could not parse deletedProductIds.json:', e);
      }
    }

    const customMap = new Map(customList.map((p) => [p.id, p]));
    const allSeeds: CraftProduct[] = [];

    for (const base of CRAFT_PRODUCTS) {
      if (!deletedIds.has(base.id)) {
        allSeeds.push(customMap.get(base.id) || base);
      }
    }

    for (const item of customList) {
      if (!deletedIds.has(item.id) && !CRAFT_PRODUCTS.some((b) => b.id === item.id)) {
        allSeeds.unshift(item);
      }
    }

    let insertedCount = 0;
    for (const p of allSeeds) {
      const res = await client.query(
        `INSERT INTO products (
          id, name, slug, category, price, price_numeric, is_on_sale,
          sale_price, sale_price_numeric, stock_quantity, is_out_of_stock,
          is_published, sku, status, material, craft_technique, origin,
          short_description, hero_image, data, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          price_numeric = EXCLUDED.price_numeric,
          is_on_sale = EXCLUDED.is_on_sale,
          sale_price = EXCLUDED.sale_price,
          sale_price_numeric = EXCLUDED.sale_price_numeric,
          stock_quantity = EXCLUDED.stock_quantity,
          is_out_of_stock = EXCLUDED.is_out_of_stock,
          is_published = EXCLUDED.is_published,
          sku = EXCLUDED.sku,
          status = EXCLUDED.status,
          material = EXCLUDED.material,
          craft_technique = EXCLUDED.craft_technique,
          origin = EXCLUDED.origin,
          short_description = EXCLUDED.short_description,
          hero_image = EXCLUDED.hero_image,
          data = EXCLUDED.data,
          updated_at = NOW()`,
        [
          p.id,
          p.name,
          p.slug,
          p.category,
          p.price,
          p.priceNumeric,
          Boolean(p.isOnSale),
          p.salePrice || null,
          p.salePriceNumeric || null,
          typeof p.stockQuantity === 'number' ? p.stockQuantity : 10,
          Boolean(p.isOutOfStock),
          p.isPublished !== false,
          p.sku || `RUH-${p.id}`,
          p.status || 'published',
          p.material,
          p.craftTechnique,
          p.origin,
          p.shortDescription,
          p.heroImage,
          JSON.stringify(p),
        ]
      );
      if (res.rowCount && res.rowCount > 0) insertedCount++;
    }
    console.log(`[MIGRATION] ✓ Seeded/Updated ${insertedCount} products in PostgreSQL.`);

    // 2. Migrate Orders
    const ordersFilePath = path.join(process.cwd(), 'src/data/orders.json');
    if (fs.existsSync(ordersFilePath)) {
      try {
        const fileContent = fs.readFileSync(ordersFilePath, 'utf8');
        const orders: Order[] = JSON.parse(fileContent || '[]');
        let orderCount = 0;
        for (const o of orders) {
          await client.query(
            `INSERT INTO orders (
              id, customer_name, customer_email, customer_phone, customer_address,
              items, subtotal, shipping, total, currency, payment_status, order_status,
              razorpay_order_id, razorpay_payment_id, razorpay_signature,
              shiprocket_order_id, shiprocket_shipment_id, shiprocket_awb_code,
              tracking_url, raw_data, created_at, updated_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
            ON CONFLICT (id) DO NOTHING`,
            [
              o.id,
              o.customer.name,
              o.customer.email,
              o.customer.phone,
              JSON.stringify(o.customer),
              JSON.stringify(o.items),
              o.subtotal,
              o.shipping || 0,
              o.total,
              o.currency || 'INR',
              o.paymentStatus || 'pending',
              o.orderStatus || 'pending',
              o.razorpayOrderId || null,
              o.razorpayPaymentId || null,
              o.razorpaySignature || null,
              o.shiprocketOrderId || null,
              o.shiprocketShipmentId || null,
              o.shiprocketAWB || null,
              o.shiprocketTrackingUrl || null,
              JSON.stringify(o),
              o.createdAt || new Date().toISOString(),
              o.updatedAt || new Date().toISOString(),
            ]
          );
          orderCount++;
        }
        console.log(`[MIGRATION] ✓ Migrated ${orderCount} existing orders to PostgreSQL.`);
      } catch (err) {
        console.warn('Orders migration warning:', err);
      }
    }

    // 3. Migrate Abandoned Carts
    const cartFilePath = path.join(process.cwd(), 'src/data/abandonedCarts.json');
    if (fs.existsSync(cartFilePath)) {
      try {
        const fileContent = fs.readFileSync(cartFilePath, 'utf8');
        const carts: AbandonedCartSession[] = JSON.parse(fileContent || '[]');
        let cartCount = 0;
        for (const c of carts) {
          await client.query(
            `INSERT INTO abandoned_carts (
              email, customer, items, subtotal, restore_token,
              reminder_sent_count, recovered, last_active_at, created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            ON CONFLICT (email) DO UPDATE SET
              items = EXCLUDED.items,
              subtotal = EXCLUDED.subtotal,
              last_active_at = EXCLUDED.last_active_at`,
            [
              c.email,
              JSON.stringify(c.customer || {}),
              JSON.stringify(c.items),
              c.subtotal,
              c.id || null,
              c.reminderSentCount || 0,
              Boolean(c.recovered),
              c.updatedAt || new Date().toISOString(),
              c.createdAt || new Date().toISOString(),
            ]
          );
          cartCount++;
        }
        console.log(`[MIGRATION] ✓ Migrated ${cartCount} abandoned cart sessions to PostgreSQL.`);
      } catch (err) {
        console.warn('Abandoned cart migration warning:', err);
      }
    }

    console.log('[MIGRATION] === PostgreSQL MIGRATION COMPLETE! ===');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error('[MIGRATION FAILED]:', err);
  process.exit(1);
});
