-- Enable required extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS "Users Table" (
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
CREATE TABLE IF NOT EXISTS "Listings Table" (
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
  owner_id UUID REFERENCES "Users Table"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments Table
CREATE TABLE IF NOT EXISTS "Investments Table" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES "Listings Table"(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES "Users Table"(id) ON DELETE CASCADE,
  fractions INTEGER NOT NULL CHECK (fractions > 0),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing Media Table
CREATE TABLE IF NOT EXISTS "Listing Media Table" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES "Listings Table"(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users Table"(email);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON "Listings Table"(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON "Listings Table"(status);
CREATE INDEX IF NOT EXISTS idx_investments_listing ON "Investments Table"(listing_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON "Investments Table"(investor_id);
CREATE INDEX IF NOT EXISTS idx_listing_media_listing ON "Listing Media Table"(listing_id);
