import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { CraftProduct } from '@/types';
import { CRAFT_PRODUCTS } from '@/data/craftData';

const customDataFilePath = path.join(process.cwd(), 'src', 'data', 'customProducts.json');
const deletedDataFilePath = path.join(process.cwd(), 'src', 'data', 'deletedProductIds.json');
const sqliteDbPath = path.join(process.cwd(), 'src', 'data', 'ruh_stone.sqlite');

let pgPool: Pool | null = null;
let sqliteDb: any = null;
let dbInitialized = false;

function getDatabaseConfig() {
  const url = process.env.DATABASE_URL || '';
  const isPostgres = url.startsWith('postgres://') || url.startsWith('postgresql://');
  return { url, isPostgres };
}

function getInitialSeedProducts(): CraftProduct[] {
  let customList: CraftProduct[] = [];
  let deletedIds = new Set<string>();

  try {
    if (fs.existsSync(customDataFilePath)) {
      customList = JSON.parse(fs.readFileSync(customDataFilePath, 'utf8') || '[]');
    }
  } catch (e) {
    console.error('Error reading customProducts.json during seed:', e);
  }

  try {
    if (fs.existsSync(deletedDataFilePath)) {
      const deleted: string[] = JSON.parse(fs.readFileSync(deletedDataFilePath, 'utf8') || '[]');
      deletedIds = new Set(deleted);
    }
  } catch (e) {
    console.error('Error reading deletedProductIds.json during seed:', e);
  }

  const customMap = new Map(customList.map((p) => [p.id, p]));
  const merged: CraftProduct[] = [];

  for (const base of CRAFT_PRODUCTS) {
    if (!deletedIds.has(base.id)) {
      merged.push(customMap.get(base.id) || base);
    }
  }

  for (const item of customList) {
    if (!deletedIds.has(item.id) && !CRAFT_PRODUCTS.some((b) => b.id === item.id)) {
      merged.unshift(item);
    }
  }

  return merged;
}

/**
 * Initializes Database (Postgres or SQLite) and creates schema & initial seeds.
 */
export async function initDatabase(): Promise<void> {
  if (dbInitialized) return;

  const { isPostgres, url } = getDatabaseConfig();

  if (isPostgres) {
    try {
      if (!pgPool) {
        pgPool = new Pool({
          connectionString: url,
          ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
        });
      }

      await pgPool.query(`
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
      `);

      // Seed if empty
      const countRes = await pgPool.query('SELECT COUNT(*) FROM products');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        console.log('[DB] Seeding initial products into PostgreSQL...');
        const seeds = getInitialSeedProducts();
        for (const p of seeds) {
          await pgPool.query(
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
    } catch (pgError) {
      console.error('[DB] PostgreSQL connection error, falling back to SQLite:', pgError);
    }
  }

  // SQLite Persistent Storage (Default)
  try {
    const dir = path.dirname(sqliteDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Dynamic import to avoid webpack build issues in environments with older @types/node
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
      console.log('[DB] Seeding initial products into SQLite...');
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
 * Syncs changes to backup JSON files for filesystem compatibility.
 */
function syncBackupJson(products: CraftProduct[]) {
  try {
    const baseIds = new Set(CRAFT_PRODUCTS.map((b) => b.id));
    const customOnly = products.filter((p) => !baseIds.has(p.id));
    const activeIds = new Set(products.map((p) => p.id));
    const deletedBase = CRAFT_PRODUCTS.filter((b) => !activeIds.has(b.id)).map((b) => b.id);

    fs.writeFileSync(customDataFilePath, JSON.stringify(customOnly, null, 2), 'utf8');
    fs.writeFileSync(deletedDataFilePath, JSON.stringify(deletedBase, null, 2), 'utf8');
  } catch (e) {
    // Non-fatal backup sync
  }
}

/**
 * Fetch all products from persistent database.
 */
export async function dbGetProducts(options?: { includeDrafts?: boolean }): Promise<CraftProduct[]> {
  await initDatabase();
  const includeDrafts = options?.includeDrafts ?? false;

  const { isPostgres } = getDatabaseConfig();

  if (isPostgres && pgPool) {
    const query = includeDrafts
      ? 'SELECT data FROM products ORDER BY created_at DESC'
      : 'SELECT data FROM products WHERE is_published = TRUE ORDER BY created_at DESC';
    const res = await pgPool.query(query);
    return res.rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
  }

  if (sqliteDb) {
    const query = includeDrafts
      ? 'SELECT data FROM products ORDER BY created_at DESC'
      : 'SELECT data FROM products WHERE is_published = 1 ORDER BY created_at DESC';
    const rows = sqliteDb.prepare(query).all() as Array<{ data: string }>;
    return rows.map((r) => JSON.parse(r.data));
  }

  // Fallback to initial seeds if database is unavailable
  return getInitialSeedProducts();
}

/**
 * Fetch a single product by slug from persistent database.
 */
export async function dbGetProductBySlug(slug: string): Promise<CraftProduct | null> {
  await initDatabase();
  const { isPostgres } = getDatabaseConfig();

  if (isPostgres && pgPool) {
    const res = await pgPool.query(
      'SELECT data FROM products WHERE slug = $1 OR id = $1 LIMIT 1',
      [slug]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
  }

  if (sqliteDb) {
    const row = sqliteDb
      .prepare('SELECT data FROM products WHERE slug = ? OR id = ? LIMIT 1')
      .get(slug, slug) as { data: string } | undefined;
    if (!row) return null;
    return JSON.parse(row.data);
  }

  const all = await dbGetProducts({ includeDrafts: true });
  return all.find((p) => p.slug === slug || p.id === slug) || null;
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

  const now = new Date().toISOString();
  const fullProduct: CraftProduct = {
    ...product,
    sku: product.sku || `RUH-${product.id}`,
    isPublished: product.isPublished !== false,
    status: product.status || 'published',
  };

  const { isPostgres } = getDatabaseConfig();

  if (isPostgres && pgPool) {
    await pgPool.query(
      `INSERT INTO products (
        id, name, slug, category, price, price_numeric, is_on_sale,
        sale_price, sale_price_numeric, stock_quantity, is_out_of_stock,
        is_published, sku, status, material, craft_technique, origin,
        short_description, hero_image, data, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW())`,
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
  } else if (sqliteDb) {
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
  } else {
    throw new Error('Database connection not established');
  }

  // Backup sync
  const currentAll = await dbGetProducts({ includeDrafts: true });
  syncBackupJson(currentAll);

  return fullProduct;
}

/**
 * Update an existing product in the persistent database.
 */
export async function dbUpdateProduct(product: CraftProduct): Promise<CraftProduct> {
  await initDatabase();

  if (!product.id) {
    throw new Error('Product id is required for update');
  }

  const now = new Date().toISOString();
  const fullProduct: CraftProduct = {
    ...product,
    sku: product.sku || `RUH-${product.id}`,
    isPublished: product.isPublished !== false,
    status: product.status || 'published',
  };

  const { isPostgres } = getDatabaseConfig();

  if (isPostgres && pgPool) {
    const res = await pgPool.query(
      `UPDATE products SET
        name = $1, slug = $2, category = $3, price = $4, price_numeric = $5,
        is_on_sale = $6, sale_price = $7, sale_price_numeric = $8,
        stock_quantity = $9, is_out_of_stock = $10, is_published = $11,
        sku = $12, status = $13, material = $14, craft_technique = $15,
        origin = $16, short_description = $17, hero_image = $18, data = $19,
        updated_at = NOW()
      WHERE id = $20`,
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
      // If it doesn't exist yet, insert it
      return dbCreateProduct(fullProduct);
    }
  } else if (sqliteDb) {
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
      // If row did not exist, insert it
      return dbCreateProduct(fullProduct);
    }
  } else {
    throw new Error('Database connection not established');
  }

  // Backup sync
  const currentAll = await dbGetProducts({ includeDrafts: true });
  syncBackupJson(currentAll);

  return fullProduct;
}

/**
 * Delete a product permanently from the persistent database.
 */
export async function dbDeleteProduct(id: string): Promise<boolean> {
  await initDatabase();

  const { isPostgres } = getDatabaseConfig();

  if (isPostgres && pgPool) {
    await pgPool.query('DELETE FROM products WHERE id = $1', [id]);
  } else if (sqliteDb) {
    sqliteDb.prepare('DELETE FROM products WHERE id = ?').run(id);
  } else {
    throw new Error('Database connection not established');
  }

  // Backup sync
  const currentAll = await dbGetProducts({ includeDrafts: true });
  syncBackupJson(currentAll);

  return true;
}
