import { Order, OrderItem } from '@/types';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Universal transactional mail dispatcher.
 * Uses Resend / transactional REST API if EMAIL_API_KEY is configured.
 * Safely logs formatted previews if no key is configured yet.
 */
export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.EMAIL_API_KEY;

  if (apiKey && !apiKey.includes('placeholder')) {
    try {
      // Standard Resend API dispatch
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'RUH STONE <patron@ruhstone.com>',
          to: [to],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[Email Dispatch Error]', res.status, err);
        return false;
      }
      return true;
    } catch (error) {
      console.error('[Email Dispatch Exception]', error);
      return false;
    }
  }

  // Safe simulation fallback
  console.log(`[Email Dispatched (Test Mode)] To: ${to} | Subject: "${subject}"`);
  return true;
}

// RUH STONE Luxury Email Styling Container
function wrapEmailTemplate(contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RUH STONE</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #23201D; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8E0D2; border-collapse: collapse;">
          <!-- Atelier Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 24px 30px; border-bottom: 1px solid #F0EAE1;">
              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; letter-spacing: 0.28em; color: #23201D; text-transform: uppercase; font-weight: 300;">RUH STONE</span>
              <p style="margin: 6px 0 0 0; font-size: 10px; letter-spacing: 0.2em; color: #7A746C; text-transform: uppercase;">HANDCRAFTED ATELIER · JAIPUR</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Atelier Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; background-color: #FAF7F2; border-top: 1px solid #E8E0D2; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 0.12em; color: #7A746C;">
                Every RUH STONE piece is born from raw earth, shaped by hand, and certified for generational provenance.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 10px; letter-spacing: 0.16em; color: #AA9B87; text-transform: uppercase;">
                <a href="https://ruhstone.com" style="color: #23201D; text-decoration: none;">ruhstone.com</a> · <a href="https://www.instagram.com/ruhstonee" style="color: #23201D; text-decoration: none;">@ruhstonee</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 1. Order Confirmation Email Template
 */
export function getOrderConfirmationEmail(order: Order): EmailPayload {
  const itemsListHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #F2ECE1;">
        <span style="font-family: Georgia, serif; font-size: 15px; color: #23201D; font-weight: normal;">${item.name}</span>
        <span style="display: block; font-size: 11px; color: #7A746C; margin-top: 2px;">Qty: ${item.quantity} · ${item.material || 'Handcrafted'}</span>
      </td>
      <td align="right" style="padding: 14px 0; border-bottom: 1px solid #F2ECE1; font-family: Georgia, serif; font-size: 14px; color: #23201D;">
        ₹${(item.priceNumeric * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>`
    )
    .join('');

  const html = wrapEmailTemplate(`
    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-align: center; margin: 0 0 12px 0;">
      Order Confirmed
    </h1>
    <p style="font-size: 13px; line-height: 1.6; color: #57524A; text-align: center; margin: 0 0 28px 0;">
      Thank you, ${order.customer.name}. Your order has been placed with our master craftspeople. Each piece will undergo rigorous inspection and hand-packaging before dispatch.
    </p>

    <div style="background-color: #FAF7F2; border: 1px solid #E8E0D2; padding: 16px 20px; margin-bottom: 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
        <tr>
          <td style="color: #7A746C; text-transform: uppercase; letter-spacing: 0.1em; padding-bottom: 6px;">Order Reference</td>
          <td align="right" style="font-weight: 600; color: #23201D;">${order.id}</td>
        </tr>
        <tr>
          <td style="color: #7A746C; text-transform: uppercase; letter-spacing: 0.1em;">Payment Status</td>
          <td align="right" style="font-weight: 600; color: #2A6638; text-transform: uppercase;">Verified Paid</td>
        </tr>
      </table>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${itemsListHtml}
      <tr>
        <td style="padding-top: 16px; font-size: 13px; color: #7A746C;">Subtotal</td>
        <td align="right" style="padding-top: 16px; font-family: Georgia, serif; font-size: 14px; color: #23201D;">₹${order.subtotal.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding-top: 6px; font-size: 13px; color: #7A746C;">Shipping (White Glove Atelier)</td>
        <td align="right" style="padding-top: 6px; font-size: 12px; color: #2A6638;">Complimentary</td>
      </tr>
      <tr>
        <td style="padding-top: 12px; border-top: 1px solid #23201D; font-size: 14px; font-weight: bold; color: #23201D;">Total Paid</td>
        <td align="right" style="padding-top: 12px; border-top: 1px solid #23201D; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #23201D;">
          ₹${order.total.toLocaleString('en-IN')}
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://ruhstone.com/orders/${order.id}" style="background-color: #23201D; color: #FAF7F2; text-decoration: none; padding: 14px 28px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; display: inline-block;">
        View Order & Provenance Status →
      </a>
    </div>
  `);

  return {
    to: order.customer.email,
    subject: `Order Confirmed: ${order.id} | RUH STONE Atelier`,
    html,
  };
}

/**
 * 2. Payment Confirmation Receipt Email Template
 */
export function getPaymentReceiptEmail(order: Order): EmailPayload {
  const html = wrapEmailTemplate(`
    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-align: center; margin: 0 0 12px 0;">
      Official Payment Receipt
    </h1>
    <p style="font-size: 13px; line-height: 1.6; color: #57524A; text-align: center; margin: 0 0 28px 0;">
      We have successfully received your payment via Razorpay secure checkout.
    </p>

    <div style="background-color: #FAF7F2; border: 1px solid #E8E0D2; padding: 18px 20px; font-size: 12px; line-height: 1.8;">
      <div><strong>Order ID:</strong> ${order.id}</div>
      <div><strong>Payment Reference:</strong> ${order.razorpayPaymentId || 'Prepaid'}</div>
      <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div><strong>Customer:</strong> ${order.customer.name}</div>
      <div><strong>Amount Charged:</strong> ₹${order.total.toLocaleString('en-IN')} (All inclusive)</div>
    </div>
  `);

  return {
    to: order.customer.email,
    subject: `Payment Receipt: ${order.id} (₹${order.total.toLocaleString('en-IN')}) | RUH STONE`,
    html,
  };
}

/**
 * 3. Abandoned Cart Recovery Email Template
 */
export function getAbandonedCartEmail(params: {
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  restoreUrl: string;
}): EmailPayload {
  const { customerEmail, customerName, items, subtotal, restoreUrl } = params;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #F2ECE1;">
        <span style="font-family: Georgia, serif; font-size: 14px; color: #23201D;">${item.name}</span>
        <span style="display: block; font-size: 11px; color: #7A746C;">Quantity: ${item.quantity}</span>
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #F2ECE1; font-family: Georgia, serif; font-size: 13px; color: #23201D;">
        ₹${(item.priceNumeric * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>`
    )
    .join('');

  const html = wrapEmailTemplate(`
    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-align: center; margin: 0 0 12px 0;">
      Your Curated Selections Await
    </h1>
    <p style="font-size: 13px; line-height: 1.6; color: #57524A; text-align: center; margin: 0 0 28px 0;">
      ${customerName ? `Hello ${customerName}, ` : 'Greetings, '}we noticed you left pieces in your atelier selection. Because our handcrafted objects are crafted in limited batches, availability cannot be held indefinitely.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${itemsHtml}
      <tr>
        <td style="padding-top: 14px; font-size: 13px; font-weight: bold; color: #23201D;">Reserved Total</td>
        <td align="right" style="padding-top: 14px; font-family: Georgia, serif; font-size: 16px; font-weight: bold; color: #23201D;">
          ₹${subtotal.toLocaleString('en-IN')}
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${restoreUrl}" style="background-color: #23201D; color: #FAF7F2; text-decoration: none; padding: 14px 32px; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; display: inline-block;">
        Restore Cart & Complete Order →
      </a>
    </div>
    <p style="font-size: 10px; color: #7A746C; text-align: center; margin: 0;">
      Complimentary insured white-glove shipping applies to all domestic orders.
    </p>
  `);

  return {
    to: customerEmail,
    subject: `Complete your collection: Handcrafted selections waiting | RUH STONE`,
    html,
  };
}

/**
 * 4. Shipping Confirmation & Tracking Email Template
 */
export function getShippingConfirmationEmail(order: Order): EmailPayload {
  const trackingLink =
    order.shiprocketTrackingUrl || `https://ruhstone.com/orders/${order.id}`;

  const html = wrapEmailTemplate(`
    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-align: center; margin: 0 0 12px 0;">
      Your Pieces Have Been Dispatched
    </h1>
    <p style="font-size: 13px; line-height: 1.6; color: #57524A; text-align: center; margin: 0 0 28px 0;">
      Your handcrafted pieces for order <strong>${order.id}</strong> have been packaged in archival protective crating and handed over to our white-glove logistics partner.
    </p>

    <div style="background-color: #FAF7F2; border: 1px solid #E8E0D2; padding: 20px; margin-bottom: 24px; font-size: 12px; line-height: 1.8;">
      <div><strong>Carrier:</strong> ${order.shiprocketCourier || 'Express White-Glove Surface'}</div>
      <div><strong>AWB / Tracking Number:</strong> ${order.shiprocketAWB || 'Assigned in transit'}</div>
      <div><strong>Destination:</strong> ${order.customer.city}, ${order.customer.pincode}</div>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="${trackingLink}" style="background-color: #23201D; color: #FAF7F2; text-decoration: none; padding: 14px 28px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; display: inline-block;">
        Track Your Shipment →
      </a>
    </div>
  `);

  return {
    to: order.customer.email,
    subject: `Dispatched: Your RUH STONE order ${order.id} is on its way`,
    html,
  };
}

/**
 * 5. Account Welcome Email
 */
export function getAccountWelcomeEmail(params: { email: string; name: string }): EmailPayload {
  const { email, name } = params;
  const html = wrapEmailTemplate(`
    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-align: center; margin: 0 0 12px 0;">
      Welcome to the RUH STONE Atelier
    </h1>
    <p style="font-size: 13px; line-height: 1.6; color: #57524A; text-align: center; margin: 0 0 24px 0;">
      Greetings, ${name || 'Patron'}. Your patron account has been established. You now have privileged access to your order history, verified provenance records, and curated heirloom selections.
    </p>

    <div style="background-color: #FAF7F2; border: 1px solid #E8E0D2; padding: 20px; margin-bottom: 24px; font-size: 12px; line-height: 1.8;">
      <div><strong>Registered Email:</strong> ${email}</div>
      <div><strong>Privilege:</strong> Verified Atelier Patron</div>
      <div><strong>Atelier Services:</strong> White-glove concierge shipping & direct artisan inquiries</div>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://ruhstone.com/account" style="background-color: #23201D; color: #FAF7F2; text-decoration: none; padding: 14px 28px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; display: inline-block;">
        Enter Your Account Dashboard →
      </a>
    </div>
  `);

  return {
    to: email,
    subject: 'Welcome to RUH STONE Atelier | Soul in Stone',
    html,
  };
}

/**
 * 6. Out For Delivery Email
 */
export function getOutForDeliveryEmail(order: Order): EmailPayload {
  const trackingLink =
    order.shiprocketTrackingUrl || `https://ruhstone.com/orders/${order.id}`;

  const html = wrapEmailTemplate(`
    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-align: center; margin: 0 0 12px 0;">
      Arriving Today: Order ${order.id}
    </h1>
    <p style="font-size: 13px; line-height: 1.6; color: #57524A; text-align: center; margin: 0 0 24px 0;">
      Your handcrafted pieces for order <strong>${order.id}</strong> are currently out for delivery with our white-glove courier partner.
    </p>

    <div style="background-color: #FAF7F2; border: 1px solid #E8E0D2; padding: 20px; margin-bottom: 24px; font-size: 12px; line-height: 1.8;">
      <div><strong>Recipient:</strong> ${order.customer.name}</div>
      <div><strong>Delivery Address:</strong> ${order.customer.address}, ${order.customer.city} (${order.customer.pincode})</div>
      <div><strong>Courier:</strong> ${order.shiprocketCourier || 'White-Glove Surface'}</div>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="${trackingLink}" style="background-color: #23201D; color: #FAF7F2; text-decoration: none; padding: 14px 28px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; display: inline-block;">
        Track Live Delivery →
      </a>
    </div>
  `);

  return {
    to: order.customer.email,
    subject: `Out for Delivery Today: Your RUH STONE order ${order.id}`,
    html,
  };
}

/**
 * 7. Order Delivered Email
 */
export function getOrderDeliveredEmail(order: Order): EmailPayload {
  const html = wrapEmailTemplate(`
    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-align: center; margin: 0 0 12px 0;">
      Delivered: Provenance in Your Home
    </h1>
    <p style="font-size: 13px; line-height: 1.6; color: #57524A; text-align: center; margin: 0 0 24px 0;">
      Your acquisition for order <strong>${order.id}</strong> has been successfully delivered. We hope these pieces bring timeless serenity and the presence of human craft to your sanctuary.
    </p>

    <div style="background-color: #FAF7F2; border: 1px solid #E8E0D2; padding: 20px; margin-bottom: 24px; font-size: 12px; line-height: 1.8;">
      <div><strong>Order Reference:</strong> ${order.id}</div>
      <div><strong>Total Amount:</strong> ₹${order.total.toLocaleString('en-IN')}</div>
      <div><strong>Care Instructions:</strong> Clean gently with a soft dry lint-free cloth. Natural stone breathes and deepens in character over time.</div>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://ruhstone.com/orders/${order.id}" style="background-color: #23201D; color: #FAF7F2; text-decoration: none; padding: 14px 28px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; display: inline-block;">
        View Acquisition Details →
      </a>
    </div>
  `);

  return {
    to: order.customer.email,
    subject: `Delivered: Your RUH STONE heirloom has arrived (${order.id})`,
    html,
  };
}

/**
 * 8. Password Reset Request Email
 */
export function getPasswordResetEmail(params: { email: string; resetUrl: string }): EmailPayload {
  const { email, resetUrl } = params;
  const html = wrapEmailTemplate(`
    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-align: center; margin: 0 0 12px 0;">
      Reset Your Patron Password
    </h1>
    <p style="font-size: 13px; line-height: 1.6; color: #57524A; text-align: center; margin: 0 0 24px 0;">
      We received a request to reset the password for your RUH STONE patron account. Select the button below to establish a new password.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="background-color: #23201D; color: #FAF7F2; text-decoration: none; padding: 14px 32px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; display: inline-block;">
        Reset Password →
      </a>
    </div>

    <p style="font-size: 11px; color: #7A746C; text-align: center; margin: 0;">
      If you did not request this change, you can safely disregard this message. Your credentials remain protected.
    </p>
  `);

  return {
    to: email,
    subject: 'Reset your password | RUH STONE Patron Security',
    html,
  };
}

