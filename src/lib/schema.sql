-- RUH STONE PostgreSQL Production Schema (Supabase / Neon / PostgreSQL)

-- 1. Products Table
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

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

-- 3. Addresses Table (Linked to user_id)
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses (user_id, is_default);

-- 4. Orders Table (Compatible with existing orders + new customer accounts)
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_address JSONB NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping NUMERIC DEFAULT 0,
  shipping_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  total_amount NUMERIC,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'pending',
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

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(255) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- 6. Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(255) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shiprocket_order_id VARCHAR(255),
  awb VARCHAR(255),
  courier_name VARCHAR(255),
  status VARCHAR(100) DEFAULT 'manifest_generated',
  tracking_url TEXT,
  estimated_delivery TIMESTAMPTZ,
  last_tracking_update TIMESTAMPTZ,
  raw_tracking_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments (order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON public.shipments (awb);
CREATE INDEX IF NOT EXISTS idx_shipments_shiprocket_order_id ON public.shipments (shiprocket_order_id);

-- 7. Wishlists Table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists (user_id);

-- 8. Abandoned Carts Table
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
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

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_restore_token ON public.abandoned_carts (restore_token);

-- 9. Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
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

CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries (email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
