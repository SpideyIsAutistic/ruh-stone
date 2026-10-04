import fs from 'fs';
import path from 'path';
import { AtelierInquiry, InquiryStatus } from '@/types';
import { getDatabaseConfig, getPgPool, initDatabase } from '@/lib/db';

const inquiriesFilePath = path.join(process.cwd(), 'src', 'data', 'inquiries.json');

function ensureDataFile() {
  try {
    const dir = path.dirname(inquiriesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(inquiriesFilePath)) {
      fs.writeFileSync(inquiriesFilePath, '[]', 'utf8');
    }
  } catch (error) {
    // Non-fatal
  }
}

async function getJsonInquiries(): Promise<AtelierInquiry[]> {
  ensureDataFile();
  try {
    const fileContent = fs.readFileSync(inquiriesFilePath, 'utf8');
    const items: AtelierInquiry[] = JSON.parse(fileContent || '[]');
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

async function saveJsonInquiries(items: AtelierInquiry[]): Promise<boolean> {
  ensureDataFile();
  try {
    fs.writeFileSync(inquiriesFilePath, JSON.stringify(items, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export function generateInquiryId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INQ-${Date.now().toString().slice(-6)}-${randomSuffix}`;
}

export async function getAllInquiries(): Promise<AtelierInquiry[]> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    try {
      await initDatabase();
      const res = await pool.query('SELECT raw_data FROM inquiries ORDER BY created_at DESC');
      return res.rows.map((r) =>
        typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data
      );
    } catch (err) {
      console.error('[DB] getAllInquiries Postgres error:', err);
    }
  }

  return getJsonInquiries();
}

export async function saveInquiry(
  inquiryData: Omit<AtelierInquiry, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    status?: InquiryStatus;
  }
): Promise<AtelierInquiry> {
  const now = new Date().toISOString();
  const newInquiry: AtelierInquiry = {
    ...inquiryData,
    id: inquiryData.id || generateInquiryId(),
    status: inquiryData.status || 'new',
    createdAt: now,
    updatedAt: now,
  };

  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    try {
      await initDatabase();
      await pool.query(
        `INSERT INTO inquiries (
          id, name, email, phone, inquiry_type, message, product_id, product_name,
          status, notes, raw_data, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          inquiry_type = EXCLUDED.inquiry_type,
          message = EXCLUDED.message,
          product_id = EXCLUDED.product_id,
          product_name = EXCLUDED.product_name,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          raw_data = EXCLUDED.raw_data,
          updated_at = EXCLUDED.updated_at`,
        [
          newInquiry.id,
          newInquiry.name,
          newInquiry.email,
          newInquiry.phone || null,
          newInquiry.inquiryType,
          newInquiry.message,
          newInquiry.productId || null,
          newInquiry.productName || null,
          newInquiry.status,
          newInquiry.notes || null,
          JSON.stringify(newInquiry),
          newInquiry.createdAt,
          newInquiry.updatedAt,
        ]
      );
    } catch (err) {
      console.error('[DB] saveInquiry Postgres error:', err);
    }
  }

  // Backup sync to local JSON
  const existing = await getJsonInquiries();
  const index = existing.findIndex((i) => i.id === newInquiry.id);
  if (index >= 0) {
    existing[index] = newInquiry;
  } else {
    existing.unshift(newInquiry);
  }
  await saveJsonInquiries(existing);

  return newInquiry;
}

export async function updateInquiryStatus(
  id: string,
  updates: {
    status?: InquiryStatus;
    notes?: string;
  }
): Promise<AtelierInquiry | null> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();
  const now = new Date().toISOString();

  let current: AtelierInquiry | null = null;

  if (isPostgres && pool) {
    try {
      await initDatabase();
      const res = await pool.query('SELECT raw_data FROM inquiries WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length > 0) {
        current = typeof res.rows[0].raw_data === 'string'
          ? JSON.parse(res.rows[0].raw_data)
          : res.rows[0].raw_data;
      }
    } catch (err) {
      console.error('[DB] updateInquiryStatus query error:', err);
    }
  }

  if (!current) {
    const list = await getJsonInquiries();
    current = list.find((i) => i.id === id) || null;
  }

  if (!current) return null;

  const updated: AtelierInquiry = {
    ...current,
    status: updates.status || current.status,
    notes: updates.notes !== undefined ? updates.notes : current.notes,
    updatedAt: now,
  };

  if (isPostgres && pool) {
    try {
      await pool.query(
        `UPDATE inquiries
         SET status = $1, notes = $2, raw_data = $3, updated_at = $4
         WHERE id = $5`,
        [updated.status, updated.notes || null, JSON.stringify(updated), updated.updatedAt, id]
      );
    } catch (err) {
      console.error('[DB] updateInquiryStatus update error:', err);
    }
  }

  const list = await getJsonInquiries();
  const idx = list.findIndex((i) => i.id === id);
  if (idx >= 0) {
    list[idx] = updated;
    await saveJsonInquiries(list);
  }

  return updated;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const { isPostgres } = getDatabaseConfig();
  const pool = getPgPool();

  if (isPostgres && pool) {
    try {
      await initDatabase();
      await pool.query('DELETE FROM inquiries WHERE id = $1', [id]);
    } catch (err) {
      console.error('[DB] deleteInquiry error:', err);
    }
  }

  const list = await getJsonInquiries();
  const filtered = list.filter((i) => i.id !== id);
  await saveJsonInquiries(filtered);

  return true;
}
