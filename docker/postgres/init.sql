-- ==============================
-- EXTENSIONS
-- ==============================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==============================
-- ENUMS
-- ==============================

CREATE TYPE user_role AS ENUM (
  'USER',
  'FARMER',
  'DELIVERY_PARTNER',
  'ADMIN'
);

CREATE TYPE order_status AS ENUM (
  'REQUESTED',
  'ACCEPTED',
  'REJECTED',
  'READY',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE delivery_type AS ENUM (
  'HOME_DELIVERY',
  'PICK_UP'
);

-- ==============================
-- USERS
-- ==============================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,

  role user_role NOT NULL DEFAULT 'USER',

  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==============================
-- SELLER PROFILES
-- ==============================

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  location GEOGRAPHY(Point, 4326) NOT NULL,
  delivery_radius_km DOUBLE PRECISION NOT NULL CHECK (delivery_radius_km > 0),

  business_type VARCHAR(50),

  rating_avg DOUBLE PRECISION DEFAULT 0,
  total_ratings INT DEFAULT 0,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX idx_seller_location ON seller_profiles USING GIST(location);

-- ==============================
-- ORDERS
-- ==============================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),

  status order_status NOT NULL DEFAULT 'REQUESTED',
  delivery delivery_type NOT NULL DEFAULT 'HOME_DELIVERY',

  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ==============================
-- ORDER ITEMS (SNAPSHOT)
-- ==============================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_id VARCHAR(100) NOT NULL,
  product_name TEXT NOT NULL,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_snapshot NUMERIC(10,2) NOT NULL CHECK (price_snapshot >= 0),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ==============================
-- ORDER ADDRESS SNAPSHOT
-- ==============================

CREATE TABLE order_addresses (
  order_id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,

  buyer_location GEOGRAPHY(Point, 4326),
  seller_location GEOGRAPHY(Point, 4326)
);

-- ==============================
-- RATINGS
-- ==============================

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,

  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),

  product_id VARCHAR(100),

  seller_rating INT CHECK (seller_rating BETWEEN 1 AND 5),
  product_rating INT CHECK (product_rating BETWEEN 1 AND 5),

  review TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ratings_seller_id ON ratings(seller_id);
CREATE INDEX idx_ratings_buyer_id ON ratings(buyer_id);

-- ==============================
-- UPDATED_AT TRIGGER FUNCTION
-- ==============================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================
-- TRIGGERS
-- ==============================

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_seller_profiles_updated_at
BEFORE UPDATE ON seller_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- OPTIONAL (HELPFUL INDEXES)
-- ==============================

-- For frequent queries
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_seller_active ON seller_profiles(is_active);
