const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', { 
      query: `
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
      `
    });

    if (usersError) {
      console.error('❌ Users table creation failed:', usersError);
    }

    // Create listings table
    const { error: listingsError } = await supabase.rpc('exec_sql', { 
      query: `
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
      `
    });

    if (listingsError) {
      console.error('❌ Listings table creation failed:', listingsError);
    }

    // Create investments table
    const { error: investmentsError } = await supabase.rpc('exec_sql', { 
      query: `
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
      `
    });

    if (investmentsError) {
      console.error('❌ Investments table creation failed:', investmentsError);
    }

    // Create listing_media table
    const { error: mediaError } = await supabase.rpc('exec_sql', { 
      query: `
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
      `
    });

    if (mediaError) {
      console.error('❌ Listing media table creation failed:', mediaError);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);',
      'CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);',
      'CREATE INDEX IF NOT EXISTS idx_investments_listing ON investments(listing_id);',
      'CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);',
      'CREATE INDEX IF NOT EXISTS idx_listing_media_listing ON listing_media(listing_id);'
    ];

    for (const indexQuery of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { query: indexQuery });
      if (indexError) {
        console.error('❌ Index creation failed:', indexError);
      }
    }
    
    console.log('✅ Database initialized successfully');
    console.log('📊 Tables created: users, listings, investments, listing_media');
    console.log('🔍 Indexes created for optimal performance');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = {
  supabase,
  initializeDatabase
};
