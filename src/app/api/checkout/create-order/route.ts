import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';
import { createOrder } from '@/lib/orders';
import { createRazorpayOrder, getRazorpayKeys } from '@/lib/razorpay';
import { captureCartSession } from '@/lib/abandonedCart';
import { CustomerInfo, OrderItem, getEffectivePrice } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer } = body as {
      items: Array<{ productId: string; quantity: number }>;
      customer: CustomerInfo;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart must contain at least one piece' },
        { status: 400 }
      );
    }

    if (!customer || !customer.email || !customer.name || !customer.phone || !customer.address) {
      return NextResponse.json(
        { error: 'Incomplete shipping or patron details' },
        { status: 400 }
      );
    }

    // SERVER-SIDE PRICE VALIDATION
    // Never trust frontend prices; calculate directly from verified product catalogue
    const allProducts = await getAllProducts();
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    const validatedItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} was not found` },
          { status: 404 }
        );
      }

      const qty = Math.max(1, Math.min(99, Math.floor(item.quantity || 1)));
      const effectivePrice = getEffectivePrice(product);
      calculatedSubtotal += effectivePrice.numeric * qty;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        heroImage: product.heroImage,
        priceNumeric: effectivePrice.numeric,
        priceFormatted: effectivePrice.price,
        quantity: qty,
        material: product.material,
      });
    }

    const shippingCharge = 0; // Complimentary atelier white-glove shipping
    const totalAmount = calculatedSubtotal + shippingCharge;
    const amountInPaise = Math.round(totalAmount * 100);

    // 1. Create Pending Order in Persistent Store
    const newOrder = await createOrder({
      customer,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shipping: shippingCharge,
      total: totalAmount,
      currency: 'INR',
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    // 2. Create Razorpay Order Server-Side
    const rzpOrder = await createRazorpayOrder({
      amountInPaise,
      currency: 'INR',
      receipt: newOrder.id,
      notes: {
        orderId: newOrder.id,
        customerName: customer.name,
        customerEmail: customer.email,
      },
    });

    // 3. Capture Incomplete Cart Session for Abandoned Cart Automation
    try {
      await captureCartSession({
        email: customer.email,
        items: validatedItems.map((vi) => ({
          productId: vi.productId,
          quantity: vi.quantity,
          priceNumeric: vi.priceNumeric,
        })),
        customer,
        subtotal: calculatedSubtotal,
      });
    } catch (captureErr) {
      console.warn('Abandoned cart capture warning:', captureErr);
    }

    const { keyId } = getRazorpayKeys();

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TjTlWcIAYsZ2hY',
    });
  } catch (error: any) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate checkout order' },
      { status: 500 }
    );
  }
}
