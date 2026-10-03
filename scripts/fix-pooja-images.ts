import fs from 'fs';
import { Pool } from 'pg';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL="?([^\s"]+)"?/);
if (!match) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: match[1],
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const selectRes = await pool.query(
    "SELECT data FROM products WHERE id = 'pooja-thaali-set-1791047952244'"
  );

  if (selectRes.rows.length === 0) {
    console.log('Product pooja-thaali-set-1791047952244 not found');
    await pool.end();
    return;
  }

  const currentData =
    typeof selectRes.rows[0].data === 'string'
      ? JSON.parse(selectRes.rows[0].data)
      : selectRes.rows[0].data;

  const img1 = '/uploads/1791021487383-ohrjf-EC298C60-D897-415B-BACF-5ED6EA7F3BEA.png';
  const img2 = '/uploads/1791021487385-gwhoq-C5BEE66F-21C6-4E2B-A345-EB404F255BF8.png';
  const img3 = '/uploads/1791021487387-ofqzq-2EEA444C-318E-4623-9073-7EA20005C559.png';

  currentData.heroImage = img1;
  currentData.images = [img1, img2, img3];
  currentData.galleryImages = [
    {
      url: img1,
      label: 'Primary Angle',
      caption: 'Pooja Thaali Set in warm natural daylight.',
    },
    {
      url: img2,
      label: 'Detail Angle 2',
      caption: 'Pooja Thaali Set - Handcrafted detail view 2.',
    },
    {
      url: img3,
      label: 'Detail Angle 3',
      caption: 'Pooja Thaali Set - Handcrafted detail view 3.',
    },
  ];

  const updateRes = await pool.query(
    'UPDATE products SET hero_image = $1, data = $2, updated_at = NOW() WHERE id = $3 RETURNING hero_image',
    [img1, JSON.stringify(currentData), 'pooja-thaali-set-1791047952244']
  );

  console.log('Successfully updated pooja-thaali-set in Supabase PostgreSQL!');
  console.log('New hero_image:', updateRes.rows[0].hero_image);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
