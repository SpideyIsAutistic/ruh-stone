import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ProductDetailModal from '../src/components/ProductDetailModal';
import { CRAFT_PRODUCTS } from '../src/data/craftData';
import fs from 'fs';
import { Pool } from 'pg';

async function main() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const match = env.match(/DATABASE_URL="?([^\s"]+)"?/);
  const pool = new Pool({
    connectionString: match![1],
    ssl: { rejectUnauthorized: false },
  });

  const res = await pool.query('SELECT data FROM products');
  const dbProducts = res.rows.map((r) =>
    typeof r.data === 'string' ? JSON.parse(r.data) : r.data
  );
  await pool.end();

  const allToTest = [...dbProducts, ...CRAFT_PRODUCTS];

  for (const p of allToTest) {
    console.log(`\n--- Testing product: "${p.name}" (id: ${p.id}) ---`);
    try {
      const html = ReactDOMServer.renderToString(
        <ProductDetailModal
          product={p}
          allProducts={allToTest}
          onClose={() => {}}
          onAddToCart={() => {}}
          onOpenEnquiry={() => {}}
          onSelectRelated={() => {}}
        />
      );
      console.log(`✓ Render SUCCESS (HTML length: ${html.length})`);
    } catch (err: any) {
      console.error(`✗ Render FAILED for "${p.name}":`, err);
    }
  }
}

main().catch(console.error);
