import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { CraftProduct } from '@/types';
import { CRAFT_PRODUCTS } from '@/data/craftData';

const customDataFilePath = path.join(process.cwd(), 'src', 'data', 'customProducts.json');
const deletedDataFilePath = path.join(process.cwd(), 'src', 'data', 'deletedProductIds.json');

let pgPool: Pool | null = null;
let sqliteDb: any = null;
let dbInitialized = false;

export function getDatabaseConfig() {
  const url = process.env.DATABASE_URL || '';
  const isPostgres = url.startsWith('postgres://') || url.startsWith('postgresql://');
  return { url, isPostgres };
}

export function getPgPool(): Pool | null {
  const { url, isPostgres } = getDatabaseConfig();
  if (!isPostgres || !url) return null;

  if (!pgPool) {
    const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
    const sanitizedUrl = url.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?$/, '');
    pgPool = new Pool({
      connectionString: sanitizedUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pgPool;
}

function getInitialSeedProducts(): CraftProduct[] {
  return CRAFT_PRODUCTS;
}

/**
 * Initializes Database (PostgreSQL primary; fallback SQLite only for offline local dev)
 */
export async function initDatabase(): Promise<void> {
  if (dbInitialized) return;

  const { isPostgres, url } = getDatabaseConfig();

  if (isPostgres) {
    try {
      const pool = getPgPool();
      if (!pool) throw new Error('Could not create PostgreSQL connection pool');

      // Create Products Table & Indexes
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          category VARCHAR(100) NOT NULL,
          price VARCHAR(50) NOT NULL,
          price_numeric NUMERIC NOT NULL,
          is_on_sale BOOLEAN DEFAULT FALSE,
          sale_price VARCHAR(50),
          sale_price_numeric NUMERIC,
          stock_quantity INTEGER DEFAULT 10,
          is_out_of_stock BOOLEAN DEFAULT FALSE,
          is_published BOOLEAN DEFAULT TRUE,
          sku VARCHAR(100),
          status VARCHAR(50) DEFAULT 'published',
          material VARCHAR(255),
          craft_technique VARCHAR(255),
          origin VARCHAR(255),
          short_description TEXT,
          hero_image TEXT NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
        CREATE INDEX IF NOT EXISTS idx_products_is_published ON products (is_published);
        CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(255) PRIMARY KEY,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50),
          customer_address JSONB NOT NULL,
          items JSONB NOT NULL,
          subtotal NUMERIC NOT NULL,
          shipping NUMERIC DEFAULT 0,
          total NUMERIC NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          payment_status VARCHAR(50) DEFAULT 'pending',
          order_status VARCHAR(50) DEFAULT 'pending',
          razorpay_order_id VARCHAR(255),
          razorpay_payment_id VARCHAR(255),
          razorpay_signature TEXT,
          shiprocket_order_id VARCHAR(255),
          shiprocket_shipment_id VARCHAR(255),
          shiprocket_awb_code VARCHAR(255),
          tracking_url TEXT,
          raw_data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);
        CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders (razorpay_order_id);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

        CREATE TABLE IF NOT EXISTS abandoned_carts (
          email VARCHAR(255) PRIMARY KEY,
          customer JSONB,
          items JSONB NOT NULL,
          subtotal NUMERIC NOT NULL,
          restore_token VARCHAR(255) UNIQUE,
          reminder_sent_count INTEGER DEFAULT 0,
          recovered BOOLEAN DEFAULT FALSE,
          last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_abandoned_carts_restore_token ON abandoned_carts (restore_token);

        CREATE TABLE IF NOT EXISTS inquiries (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          inquiry_type VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          product_id VARCHAR(255),
          product_name VARCHAR(255),
          status VARCHAR(50) DEFAULT 'new',
          notes TEXT,
          raw_data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries (email);
        CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
        CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
      `);

      // Seed initial products if table is completely empty
      const countRes = await pool.query('SELECT COUNT(*) FROM products');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        console.log('[DB] Seeding initial products into PostgreSQL...');
        const seeds = getInitialSeedProducts();
        for (const p of seeds) {
          await pool.query(
            `INSERT INTO products (
              id, name, slug, category, price, price_numeric, is_on_sale,
              sale_price, sale_price_numeric, stock_quantity, is_out_of_stock,
              is_published, sku, status, material, craft_technique, origin,
              short_description, hero_image, data, created_at, updated_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW())
            ON CONFLICT (id) DO NOTHING`,
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
        }
      }

      dbInitialized = true;
      return;
    } catch (pgError: any) {
      console.warn('[DB] PostgreSQL initialization warning:', pgError?.message || pgError);
      console.warn('[DB] PostgreSQL unreachable; falling through to initialize SQLite storage.');
      // Gracefully continue and initialize SQLite storage
    }
  }

  // SQLite Persistent Storage (Offline local development & fallback storage)
  try {
    let sqliteDbPath = path.join(process.cwd(), 'src', 'data', 'ruh_stone.sqlite');
    let dir = path.dirname(sqliteDbPath);

    // If local src/data is not writable (e.g. read-only permissions), fall back to writable /tmp
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.accessSync(dir, fs.constants.W_OK);
    } catch {
      sqliteDbPath = path.join('/tmp', 'ruh_stone.sqlite');
      dir = '/tmp';
    }

    // @ts-ignore
    const { DatabaseSync } = await import('node:sqlite');
    sqliteDb = new DatabaseSync(sqliteDbPath);

    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        price TEXT NOT NULL,
        price_numeric REAL NOT NULL,
        is_on_sale INTEGER DEFAULT 0,
        sale_price TEXT,
        sale_price_numeric REAL,
        stock_quantity INTEGER DEFAULT 10,
        is_out_of_stock INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 1,
        sku TEXT,
        status TEXT DEFAULT 'published',
        material TEXT,
        craft_technique TEXT,
        origin TEXT,
        short_description TEXT,
        hero_image TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    const countRow = sqliteDb.prepare('SELECT COUNT(*) as count FROM products').get() as {
      count: number;
    };

    if (countRow.count === 0) {
      const seeds = getInitialSeedProducts();
      const insertStmt = sqliteDb.prepare(`
        INSERT OR REPLACE INTO products (
          id, name, slug, category, price, price_numeric, is_on_sale,
          sale_price, sale_price_numeric, stock_quantity, is_out_of_stock,
          is_published, sku, status, material, craft_technique, origin,
          short_description, hero_image, data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      for (const p of seeds) {
        insertStmt.run(
          p.id,
          p.name,
          p.slug,
          p.category,
          p.price,
          p.priceNumeric,
          p.isOnSale ? 1 : 0,
          p.salePrice || null,
          p.salePriceNumeric || null,
          typeof p.stockQuantity === 'number' ? p.stockQuantity : 10,
          p.isOutOfStock ? 1 : 0,
          p.isPublished !== false ? 1 : 0,
          p.sku || `RUH-${p.id}`,
          p.status || 'published',
          p.material,
          p.craftTechnique,
          p.origin,
          p.shortDescription,
          p.heroImage,
          JSON.stringify(p),
          now,
          now
        );
      }
    }

    dbInitialized = true;
  } catch (sqliteError) {
    console.error('[DB] SQLite initialization error:', sqliteError);
    throw sqliteError;
  }
}

/**
 * Syncs changes to backup JSON files for local offline compatibility.
 */
function syncBackupJson(products: CraftProduct[]) {
  try {
    const baseIds = new Set(CRAFT_PRODUCTS.map((b) => b.id));
    const customOnly = products.filter((p) => !baseIds.has(p.id));
    const activeIds = new Set(products.map((p) => p.id));
    const deletedBase = CRAFT_PRODUCTS.filter((b) => !activeIds.has(b.id)).map((b) => b.id);

    if (fs.existsSync(path.dirname(customDataFilePath))) {
      fs.writeFileSync(customDataFilePath, JSON.stringify(customOnly, null, 2), 'utf8');
      fs.writeFileSync(deletedDataFilePath, JSON.stringify(deletedBase, null, 2), 'utf8');
    }
  } catch (e) {
    // Non-fatal backup sync
  }
}

/**
 * Fetch all products from persistent database.
 */
export async function dbGetProducts(options?: { includeDrafts?: boolean }): Promise<CraftProduct[]> {
  try {
    await initDatabase();
    const includeDrafts = options?.includeDrafts ?? false;

    const { isPostgres } = getDatabaseConfig();
    const pool = getPgPool();

    if (isPostgres && pool) {
      try {
        const query = includeDrafts
          ? 'SELECT data FROM products ORDER BY created_at DESC'
          : 'SELECT data FROM products WHERE is_published = TRUE ORDER BY created_at DESC';
        const res = await pool.query(query);
        if (res.rows && res.rows.length > 0) {
          return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
        }
      } catch (pgQueryErr) {
        console.warn('[DB] PostgreSQL query failed, attempting SQLite fallback:', pgQueryErr);
      }
    }

    if (sqliteDb) {
      try {
        const query = includeDrafts
          ? 'SELECT data FROM products ORDER BY created_at DESC'
          : 'SELECT data FROM products WHERE is_published = 1 ORDER BY created_at DESC';
        const rows = sqliteDb.prepare(query).all() as Array<{ data: string }>;
        if (rows && rows.length > 0) {
          return rows.map((r) => JSON.parse(r.data));
        }
      } catch (sqlErr) {
        console.warn('[DB] SQLite query failed:', sqlErr);
      }
    }
  } catch (err: any) {
    console.warn('[DB] dbGetProducts error:', err?.message || err);
  }

  // Bedrock fallback to CRAFT_PRODUCTS
  return CRAFT_PRODUCTS;
}

/**
 * Fetch a single product by slug from persistent database.
 */
export async function dbGetProductBySlug(slug: string): Promise<CraftProduct | null> {
  try {
    await initDatabase();
    const { isPostgres } = getDatabaseConfig();
    const pool = getPgPool();

    const rawSlug = slug.trim();
    const trimmedSlug = rawSlug.replace(/(^-+|-+$)/g, '');
    const withTrailing = `${trimmedSlug}-`;

    if (isPostgres && pool) {
      try {
        const res = await pool.query(
          `SELECT data FROM products 
           WHERE slug = $1 
              OR slug = $2 
              OR slug = $3 
              OR id = $1 
              OR id = $2 
              OR TRIM(BOTH '-' FROM slug) = $2
           LIMIT 1`,
          [rawSlug, trimmedSlug, withTrailing]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        }
      } catch (pgQueryErr) {
        console.warn('[DB] PostgreSQL slug query failed, falling back to local data:', pgQueryErr);
      }
    }

    if (sqliteDb) {
      try {
        const row = sqliteDb
          .prepare(`
            SELECT data FROM products 
            WHERE slug = ? 
               OR slug = ? 
               OR slug = ? 
               OR id = ? 
               OR id = ? 
            LIMIT 1
          `)
          .get(rawSlug, trimmedSlug, withTrailing, rawSlug, trimmedSlug) as { data: string } | undefined;
        if (row) return JSON.parse(row.data);
      } catch (sqlErr) {
        console.warn('[DB] SQLite slug query failed:', sqlErr);
      }
    }
  } catch (err: any) {
    console.warn('[DB] dbGetProductBySlug error:', err?.message || err);
  }

  // Fallback to CRAFT_PRODUCTS
  const staticFound = CRAFT_PRODUCTS.find(
    (p) =>
      p.slug === slug ||
      p.id === slug ||
      p.slug.replace(/(^-+|-+$)/g, '') === slug.replace(/(^-+|-+$)/g, '')
  );
  return staticFound || null;
}

/**
 * Fetch a single product by id from persistent database.
 */
export async function dbGetProductById(id: string): Promise<CraftProduct | null> {
  return dbGetProductBySlug(id);
}

/**
 * Create a new product in the persistent database.
 */
export async function dbCreateProduct(product: CraftProduct): Promise<CraftProduct> {
  await initDatabase();

  if (!product.id || !product.name || !product.slug) {
    throw new Error('Product id, name, and slug are required for database insert');
  }

  const fullProduct: CraftProduct = {
    ...product,
    sku: product.sku || `RUH-${product.id}`,
    isPublished: product.isPublished !== false,
    status: product.status || 'published',
  };

  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    const res = await pool.query(
      `INSERT INTO products (
        id, name, slug, category, price, price_numeric, is_on_sale,
        sale_price, sale_price_numeric, stock_quantity, is_out_of_stock,
        is_published, sku, status, material, craft_technique, origin,
        short_description, hero_image, data, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW())
      RETURNING data`,
      [
        fullProduct.id,
        fullProduct.name,
        fullProduct.slug,
        fullProduct.category,
        fullProduct.price,
        fullProduct.priceNumeric,
        Boolean(fullProduct.isOnSale),
        fullProduct.salePrice || null,
        fullProduct.salePriceNumeric || null,
        typeof fullProduct.stockQuantity === 'number' ? fullProduct.stockQuantity : 10,
        Boolean(fullProduct.isOutOfStock),
        fullProduct.isPublished !== false,
        fullProduct.sku,
        fullProduct.status,
        fullProduct.material,
        fullProduct.craftTechnique,
        fullProduct.origin,
        fullProduct.shortDescription,
        fullProduct.heroImage,
        JSON.stringify(fullProduct),
      ]
    );

    if (res.rowCount === 0) {
      throw new Error('Database write rejected: no rows were returned from PostgreSQL insert');
    }

    const saved = typeof res.rows[0].data === 'string' ? JSON.parse(res.rows[0].data) : res.rows[0].data;

    // Backup sync
    const currentAll = await dbGetProducts({ includeDrafts: true });
    syncBackupJson(currentAll);

    return saved;
  }

  if (sqliteDb) {
    const now = new Date().toISOString();
    const insertStmt = sqliteDb.prepare(`
      INSERT INTO products (
        id, name, slug, category, price, price_numeric, is_on_sale,
        sale_price, sale_price_numeric, stock_quantity, is_out_of_stock,
        is_published, sku, status, material, craft_technique, origin,
        short_description, hero_image, data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      fullProduct.id,
      fullProduct.name,
      fullProduct.slug,
      fullProduct.category,
      fullProduct.price,
      fullProduct.priceNumeric,
      fullProduct.isOnSale ? 1 : 0,
      fullProduct.salePrice || null,
      fullProduct.salePriceNumeric || null,
      typeof fullProduct.stockQuantity === 'number' ? fullProduct.stockQuantity : 10,
      fullProduct.isOutOfStock ? 1 : 0,
      fullProduct.isPublished !== false ? 1 : 0,
      fullProduct.sku,
      fullProduct.status,
      fullProduct.material,
      fullProduct.craftTechnique,
      fullProduct.origin,
      fullProduct.shortDescription,
      fullProduct.heroImage,
      JSON.stringify(fullProduct),
      now,
      now
    );

    const currentAll = await dbGetProducts({ includeDrafts: true });
    syncBackupJson(currentAll);

    return fullProduct;
  }

  throw new Error('Database connection not established');
}

/**
 * Update an existing product in the persistent database.
 */
export async function dbUpdateProduct(product: CraftProduct): Promise<CraftProduct> {
  await initDatabase();

  if (!product.id) {
    throw new Error('Product id is required for update');
  }

  const fullProduct: CraftProduct = {
    ...product,
    sku: product.sku || `RUH-${product.id}`,
    isPublished: product.isPublished !== false,
    status: product.status || 'published',
  };

  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    const res = await pool.query(
      `UPDATE products SET
        name = $1, slug = $2, category = $3, price = $4, price_numeric = $5,
        is_on_sale = $6, sale_price = $7, sale_price_numeric = $8,
        stock_quantity = $9, is_out_of_stock = $10, is_published = $11,
        sku = $12, status = $13, material = $14, craft_technique = $15,
        origin = $16, short_description = $17, hero_image = $18, data = $19,
        updated_at = NOW()
      WHERE id = $20
      RETURNING data`,
      [
        fullProduct.name,
        fullProduct.slug,
        fullProduct.category,
        fullProduct.price,
        fullProduct.priceNumeric,
        Boolean(fullProduct.isOnSale),
        fullProduct.salePrice || null,
        fullProduct.salePriceNumeric || null,
        typeof fullProduct.stockQuantity === 'number' ? fullProduct.stockQuantity : 10,
        Boolean(fullProduct.isOutOfStock),
        fullProduct.isPublished !== false,
        fullProduct.sku,
        fullProduct.status,
        fullProduct.material,
        fullProduct.craftTechnique,
        fullProduct.origin,
        fullProduct.shortDescription,
        fullProduct.heroImage,
        JSON.stringify(fullProduct),
        fullProduct.id,
      ]
    );

    if (res.rowCount === 0) {
      return dbCreateProduct(fullProduct);
    }

    const updated = typeof res.rows[0].data === 'string' ? JSON.parse(res.rows[0].data) : res.rows[0].data;
    const currentAll = await dbGetProducts({ includeDrafts: true });
    syncBackupJson(currentAll);
    return updated;
  }

  if (sqliteDb) {
    const now = new Date().toISOString();
    const updateStmt = sqliteDb.prepare(`
      UPDATE products SET
        name = ?, slug = ?, category = ?, price = ?, price_numeric = ?,
        is_on_sale = ?, sale_price = ?, sale_price_numeric = ?,
        stock_quantity = ?, is_out_of_stock = ?, is_published = ?,
        sku = ?, status = ?, material = ?, craft_technique = ?,
        origin = ?, short_description = ?, hero_image = ?, data = ?,
        updated_at = ?
      WHERE id = ?
    `);

    const result = updateStmt.run(
      fullProduct.name,
      fullProduct.slug,
      fullProduct.category,
      fullProduct.price,
      fullProduct.priceNumeric,
      fullProduct.isOnSale ? 1 : 0,
      fullProduct.salePrice || null,
      fullProduct.salePriceNumeric || null,
      typeof fullProduct.stockQuantity === 'number' ? fullProduct.stockQuantity : 10,
      fullProduct.isOutOfStock ? 1 : 0,
      fullProduct.isPublished !== false ? 1 : 0,
      fullProduct.sku,
      fullProduct.status,
      fullProduct.material,
      fullProduct.craftTechnique,
      fullProduct.origin,
      fullProduct.shortDescription,
      fullProduct.heroImage,
      JSON.stringify(fullProduct),
      now,
      fullProduct.id
    );

    if (result.changes === 0) {
      return dbCreateProduct(fullProduct);
    }

    const currentAll = await dbGetProducts({ includeDrafts: true });
    syncBackupJson(currentAll);
    return fullProduct;
  }

  throw new Error('Database connection not established');
}

/**
 * Delete a product permanently from the persistent database.
 */
export async function dbDeleteProduct(id: string): Promise<boolean> {
  await initDatabase();

  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    const res = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    const currentAll = await dbGetProducts({ includeDrafts: true });
    syncBackupJson(currentAll);
    return (res.rowCount ?? 0) > 0;
  }

  if (sqliteDb) {
    sqliteDb.prepare('DELETE FROM products WHERE id = ?').run(id);
    const currentAll = await dbGetProducts({ includeDrafts: true });
    syncBackupJson(currentAll);
    return true;
  }

  throw new Error('Database connection not established');
}
