-- RUH STONE PostgreSQL Production Schema (Supabase / Neon / PostgreSQL)

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
