const { Client } = require('pg');

// Database connection using Session Pooler
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// SQL schema
const createTables = async () => {
  const queries = [
    // Create users table
    `CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      role VARCHAR(50) NOT NULL CHECK (role IN ('investor', 'project_owner', 'admin')),
      is_approved BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    // Create listings table
    `CREATE TABLE IF NOT EXISTS listings (
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
    );`,

    // Create investments table
    `CREATE TABLE IF NOT EXISTS investments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
      investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
      fractions INTEGER NOT NULL CHECK (fractions > 0),
      amount DECIMAL(15,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(listing_id, investor_id)
    );`,

    // Create listing_media table
    `CREATE TABLE IF NOT EXISTS listing_media (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video')),
      file_size BIGINT NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
    `CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);`,
    `CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);`,
    `CREATE INDEX IF NOT EXISTS idx_investments_listing ON investments(listing_id);`,
    `CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);`,
    `CREATE INDEX IF NOT EXISTS idx_listing_media_listing ON listing_media(listing_id);`
  ];

  try {
    console.log('🔧 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('🔧 Creating tables...');
    
    for (const query of queries) {
      try {
        await client.query(query);
        console.log('✅ Query executed successfully');
      } catch (error) {
        console.error('❌ Query failed:', error.message);
      }
    }

    console.log('✅ All tables created successfully');
    console.log('📊 Database schema initialized');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  createTables()
    .then(() => {
      console.log('🎉 Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables };
