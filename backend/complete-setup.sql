-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('investor', 'project_owner', 'admin')),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  fractions INTEGER NOT NULL CHECK (fractions > 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0 AND duration_days <= 180),
  max_days INTEGER DEFAULT 180,
  days_left INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'funded')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fractions INTEGER NOT NULL CHECK (fractions > 0),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, investor_id)
);

-- Listing Media Table
CREATE TABLE IF NOT EXISTS listing_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_investments_listing ON investments(listing_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_listing_media_listing ON listing_media(listing_id);


-- Insert Users Data
INSERT INTO users (id, email, password_hash, full_name, role, is_approved, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000001', 'admin@landinvest.com', '$2b$10$example_hash_admin123', 'Admin User', 'admin', true, '2024-01-01 00:00:00', '2024-01-01 00:00:00');
INSERT INTO users (id, email, password_hash, full_name, role, is_approved, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000002', 'investor@example.com', '$2b$10$example_hash_investor123', 'John Investor', 'investor', true, '2024-01-01 00:00:00', '2024-01-01 00:00:00');
INSERT INTO users (id, email, password_hash, full_name, role, is_approved, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000003', 'owner@example.com', '$2b$10$example_hash_owner123', 'Sarah Owner', 'project_owner', true, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- Insert Listings Data
INSERT INTO listings (id, title, description, location, target_amount, fractions, duration_days, max_days, days_left, status, progress, owner_id, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000001', 'Premium Beach Front Property', 'Luxury beachfront property with stunning ocean views and direct beach access. Perfect for investment with high rental potential.', 'Miami Beach', Florida, 500000.00, 50, 90, 180, '90', active, '0', '00000000-0000-0000-0000-000000000003', '2024-01-01 00:00:00');
INSERT INTO listings (id, title, description, location, target_amount, fractions, duration_days, max_days, days_left, status, progress, owner_id, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000002', 'Downtown Commercial Space', 'Prime commercial real estate in downtown business district. High foot traffic and excellent visibility.', 'New York City', New York, 750000.00, 75, 120, 180, '120', active, '0', '00000000-0000-0000-0000-000000000003', '2024-01-01 00:00:00');
INSERT INTO listings (id, title, description, location, target_amount, fractions, duration_days, max_days, days_left, status, progress, owner_id, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000003', 'Mountain Resort Land', 'Beautiful mountain land perfect for eco-tourism development. Surrounded by natural beauty and hiking trails.', 'Denver', Colorado, 300000.00, 30, 60, 180, '60', active, '0', '00000000-0000-0000-0000-000000000003', '2024-01-01 00:00:00');

-- Insert Investments Data
INSERT INTO investments (id, listing_id, investor_id, fractions, amount, status, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 5, 50000.00, 'pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00');
INSERT INTO investments (id, listing_id, investor_id, fractions, amount, status, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 3, 30000.00, 'pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00');
INSERT INTO investments (id, listing_id, investor_id, fractions, amount, status, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 10, 100000.00, 'pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- Insert Listing Media Data
INSERT INTO listing_media (id, listing_id, file_name, file_path, file_type, file_size, mime_type, created_at) VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'beach_front_1.jpg', '/uploads/listings/beach_front_1.jpg', 'image', 2048000, 'image/jpeg', '2024-01-01 00:00:00');
INSERT INTO listing_media (id, listing_id, file_name, file_path, file_type, file_size, mime_type, created_at) VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'beach_front_2.jpg', '/uploads/listings/beach_front_2.jpg', 'image', 1536000, 'image/jpeg', '2024-01-01 00:00:00');
INSERT INTO listing_media (id, listing_id, file_name, file_path, file_type, file_size, mime_type, created_at) VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'beach_tour.mp4', '/uploads/listings/beach_tour.mp4', 'video', 5120000, 'video/mp4', '2024-01-01 00:00:00');
INSERT INTO listing_media (id, listing_id, file_name, file_path, file_type, file_size, mime_type, created_at) VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'commercial_space_1.jpg', '/uploads/listings/commercial_space_1.jpg', 'image', 3072000, 'image/jpeg', '2024-01-01 00:00:00');
INSERT INTO listing_media (id, listing_id, file_name, file_path, file_type, file_size, mime_type, created_at) VALUES ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'commercial_space_2.jpg', '/uploads/listings/commercial_space_2.jpg', 'image', 2560000, 'image/jpeg', '2024-01-01 00:00:00');
INSERT INTO listing_media (id, listing_id, file_name, file_path, file_type, file_size, mime_type, created_at) VALUES ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'mountain_land_1.jpg', '/uploads/listings/mountain_land_1.jpg', 'image', 1792000, 'image/jpeg', '2024-01-01 00:00:00');
