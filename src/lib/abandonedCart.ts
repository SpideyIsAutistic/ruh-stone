import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AbandonedCartSession, OrderItem, CustomerInfo } from '@/types';
import { getAllProducts } from '@/lib/products';
import { getAbandonedCartEmail, sendEmail } from '@/lib/email';

const cartsFilePath = path.join(process.cwd(), 'src', 'data', 'abandonedCarts.json');

function ensureDataFile() {
  try {
    const dir = path.dirname(cartsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(cartsFilePath)) {
      fs.writeFileSync(cartsFilePath, '[]', 'utf8');
    }
  } catch (error) {
    console.error('Failed to initialize abandoned carts file:', error);
  }
}

async function getCartSessions(): Promise<AbandonedCartSession[]> {
  ensureDataFile();
  try {
    const fileContent = fs.readFileSync(cartsFilePath, 'utf8');
    return JSON.parse(fileContent || '[]');
  } catch (error) {
    console.error('Error reading abandoned cart sessions:', error);
    return [];
  }
}

async function saveCartSessions(sessions: AbandonedCartSession[]): Promise<boolean> {
  ensureDataFile();
  try {
    fs.writeFileSync(cartsFilePath, JSON.stringify(sessions, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving abandoned cart sessions:', error);
    return false;
  }
}

/**
 * Capture an incomplete cart session during checkout.
 * Called when the customer enters their email or proceeds to payment.
 */
export async function captureCartSession(params: {
  email: string;
  items: Array<{ productId: string; quantity: number; priceNumeric: number }>;
  customer?: Partial<CustomerInfo>;
  subtotal: number;
}): Promise<string> {
  const { email, items, customer, subtotal } = params;
  if (!email || !items || items.length === 0) {
    throw new Error('Email and non-empty items are required for cart capture');
  }

  const sessions = await getCartSessions();
  const existingIdx = sessions.findIndex(
    (s) => s.email.toLowerCase() === email.toLowerCase() && !s.recovered
  );

  const now = new Date().toISOString();

  if (existingIdx > -1) {
    // Update existing active session
    sessions[existingIdx].items = items;
    sessions[existingIdx].customer = { ...sessions[existingIdx].customer, ...customer };
    sessions[existingIdx].subtotal = subtotal;
    sessions[existingIdx].updatedAt = now;
    await saveCartSessions(sessions);
    return sessions[existingIdx].id;
  }

  // Create new session with random unguessable token
  const token = crypto.randomBytes(24).toString('hex');
  const newSession: AbandonedCartSession = {
    id: token,
    email: email.toLowerCase().trim(),
    customer: customer || {},
    items,
    subtotal,
    createdAt: now,
    updatedAt: now,
    recovered: false,
    reminderSentCount: 0,
  };

  sessions.unshift(newSession);
  await saveCartSessions(sessions);
  return token;
}

/**
 * Marks an abandoned cart session as recovered when payment is completed.
 * This cancels any future reminder emails.
 */
export async function markCartRecovered(emailOrToken: string): Promise<boolean> {
  const sessions = await getCartSessions();
  let modified = false;

  for (const session of sessions) {
    if (
      (session.id === emailOrToken ||
        session.email.toLowerCase() === emailOrToken.toLowerCase()) &&
      !session.recovered
    ) {
      session.recovered = true;
      session.updatedAt = new Date().toISOString();
      modified = true;
    }
  }

  if (modified) {
    await saveCartSessions(sessions);
  }
  return modified;
}

/**
 * Retrieves a cart session by its secure token for cart restoration.
 */
export async function getCartSessionByToken(
  token: string
): Promise<AbandonedCartSession | null> {
  const sessions = await getCartSessions();
  return sessions.find((s) => s.id === token) || null;
}

/**
 * Background / Cron processor for sending abandoned cart recovery emails.
 * - Reminder 1: ~1 hour after cart capture
 * - Reminder 2: ~24 hours after cart capture (if still unrecovered)
 */
export async function processAbandonedCartReminders(): Promise<{
  processed: number;
  remindersSent: number;
}> {
  const sessions = await getCartSessions();
  const allProducts = await getAllProducts();
  const productMap = new Map(allProducts.map((p) => [p.id, p]));

  const now = Date.now();
  let remindersSent = 0;
  let modified = false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ruhstone.com';

  for (const session of sessions) {
    if (session.recovered) continue;

    const createdAt = new Date(session.createdAt).getTime();
    const ageHours = (now - createdAt) / (1000 * 60 * 60);

    const shouldSendFirstReminder =
      ageHours >= 1 && session.reminderSentCount === 0;
    const shouldSendSecondReminder =
      ageHours >= 24 && session.reminderSentCount === 1;

    if (shouldSendFirstReminder || shouldSendSecondReminder) {
      // Hydrate items
      const hydratedItems: OrderItem[] = [];
      for (const item of session.items) {
        const product = productMap.get(item.productId);
        if (product) {
          hydratedItems.push({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            heroImage: product.heroImage,
            priceNumeric: item.priceNumeric,
            priceFormatted: `₹${item.priceNumeric.toLocaleString('en-IN')}`,
            quantity: item.quantity,
            material: product.material,
          });
        }
      }

      if (hydratedItems.length > 0) {
        const restoreUrl = `${siteUrl}/?restore=${session.id}`;
        const emailPayload = getAbandonedCartEmail({
          customerEmail: session.email,
          customerName: session.customer?.name,
          items: hydratedItems,
          subtotal: session.subtotal,
          restoreUrl,
        });

        await sendEmail(emailPayload);
        session.reminderSentCount += 1;
        session.lastReminderAt = new Date().toISOString();
        remindersSent += 1;
        modified = true;
      }
    }
  }

  if (modified) {
    await saveCartSessions(sessions);
  }

  return { processed: sessions.length, remindersSent };
}
