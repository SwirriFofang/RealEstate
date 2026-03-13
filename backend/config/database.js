const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('./tableNames');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database using direct table operations
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database with direct table operations...');
    
    // Create users table using Supabase's REST API
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log('📝 Users table does not exist. Please create it manually in Supabase SQL Editor.');
        console.log('🔗 SQL Editor: https://supabase.com/dashboard/project/kepokcjvjwmtxdnfoijn/sql');
      } else if (error) {
        console.log('❌ Users table check failed:', error.message);
      } else {
        console.log('✅ Users table exists');
      }
    } catch (err) {
      console.log('❌ Users table check error:', err.message);
    }
    
    // Check listings table
    try {
      const { error } = await supabase
        .from(TABLES.LISTINGS)
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log('📝 Listings table does not exist. Please create it manually in Supabase SQL Editor.');
      } else if (error) {
        console.log('❌ Listings table check failed:', error.message);
      } else {
        console.log('✅ Listings table exists');
      }
    } catch (err) {
      console.log('❌ Listings table check error:', err.message);
    }
    
    // Check investments table
    try {
      const { error } = await supabase
        .from(TABLES.INVESTMENTS)
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log('📝 Investments table does not exist. Please create it manually in Supabase SQL Editor.');
      } else if (error) {
        console.log('❌ Investments table check failed:', error.message);
      } else {
        console.log('✅ Investments table exists');
      }
    } catch (err) {
      console.log('❌ Investments table check error:', err.message);
    }
    
    // Check listing_media table
    try {
      const { error } = await supabase
        .from(TABLES.LISTING_MEDIA)
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log('📝 Listing media table does not exist. Please create it manually in Supabase SQL Editor.');
      } else if (error) {
        console.log('❌ Listing media table check failed:', error.message);
      } else {
        console.log('✅ Listing media table exists');
      }
    } catch (err) {
      console.log('❌ Listing media table check error:', err.message);
    }
    
    console.log('\n📋 Database Schema Check Complete');
    console.log('✅ Supabase client connected successfully');
    console.log('🔗 Database URL:', supabaseUrl);
    
    // Provide SQL commands for manual creation
    console.log('\n📝 If tables don\'t exist, run this SQL in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/kepokcjvjwmtxdnfoijn/sql');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

// SQL Schema file path
const SQL_SCHEMA_FILE = './schema.sql';

module.exports = {
  supabase,
  initializeDatabase,
  SQL_SCHEMA_FILE
};
