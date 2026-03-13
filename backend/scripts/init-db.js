require('dotenv').config();
const { supabase, initializeDatabase } = require('../config/database');

async function initDatabase() {
  console.log('🔧 Initializing LandInvest database...');
  
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - listings');
    console.log('   - investments');
    console.log('   - listing_media');
    console.log('   - Indexes');
    console.log('');
    console.log('🚀 You can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('🔍 Please check your Supabase configuration:');
    console.log('   - SUPABASE_URL is correct');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY is valid');
    console.log('   - Supabase project is active');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
