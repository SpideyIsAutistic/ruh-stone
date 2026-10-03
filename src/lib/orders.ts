import fs from 'fs';
import path from 'path';
import { Order, PaymentStatus, OrderStatus } from '@/types';

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
    console.error('Failed to initialize orders data file:', error);
  }
}

export async function getAllOrders(): Promise<Order[]> {
  ensureDataFile();
  try {
    const fileContent = fs.readFileSync(ordersFilePath, 'utf8');
    const orders: Order[] = JSON.parse(fileContent || '[]');
    // Sort descending by creation date
    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

async function saveOrders(orders: Order[]): Promise<boolean> {
  ensureDataFile();
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving orders:', error);
    return false;
  }
}

export function generateOrderId(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `RUH-2026-${randomSuffix}`;
}

export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const orders = await getAllOrders();
  const now = new Date().toISOString();

  let id = generateOrderId();
  // Ensure uniqueness
  while (orders.some((o) => o.id === id)) {
    id = generateOrderId();
  }

  const newOrder: Order = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  orders.unshift(newOrder);
  await saveOrders(orders);
  return newOrder;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getAllOrders();
  return orders.find((o) => o.id === id) || null;
}

export async function getOrderByRazorpayOrderId(rzpOrderId: string): Promise<Order | null> {
  const orders = await getAllOrders();
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
  const orders = await getAllOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  orders[index] = {
    ...orders[index],
    paymentStatus: paymentData.status,
    orderStatus: paymentData.status === 'paid' ? 'confirmed' : orders[index].orderStatus,
    razorpayPaymentId: paymentData.paymentId,
    razorpaySignature: paymentData.signature || orders[index].razorpaySignature,
    updatedAt: now,
  };

  await saveOrders(orders);
  return orders[index];
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
  const orders = await getAllOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  orders[index] = {
    ...orders[index],
    ...shippingData,
    updatedAt: now,
  };

  await saveOrders(orders);
  return orders[index];
}
