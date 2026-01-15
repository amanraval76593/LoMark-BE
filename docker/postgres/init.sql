-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;
-- User roles enum
CREATE TYPE user_role AS ENUM (
  'USER',
  'FARMER',
  'DELIVERY_PARTNER',
  'ADMIN'
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326),

  role user_role NOT NULL DEFAULT 'USER',

  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);


CREATE TYPE order_status AS ENUM(
  'REQUESTED',
  'ACCEPTED',
  'REJECTED',
  'READY',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED'

);

CREATE TYPE delivery_type AS ENUM(
  'HOME_DELIVERY',
  'PICK_UP'
);

create TABLE orders(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,

  status order_status NOT NULL DEFAULT 'REQUESTED',
  delivery delivery_type NOT NULL DEFAULT 'HOME_DELIVERY',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL

);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);


CREATE TABLE order_items(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL,
  product_id VARCHAR(100) NOT NULL,

  quantity INTEGER NOT NULL CHECK(quantity>0) ,
  price_snapshot NUMERIC(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
);


CREATE INDEX idx_order_items_order_id ON order_items(order_id);