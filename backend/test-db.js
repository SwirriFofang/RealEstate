require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testDatabase() {
  console.log('🔧 Testing Supabase Database Connection...');
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('✅ Supabase client initialized');
    console.log('🔗 URL:', process.env.SUPABASE_URL);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    if (error) {
      console.log('❌ Database connection test failed:', error.message);
    } else {
      console.log('✅ Database connection successful!');
      console.log('📊 Found tables:', data?.map(t => t.tablename).join(', ') || 'None');
    }
    
    // Test users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table test failed:', usersError.message);
      console.log('📝 Tables need to be created in Supabase SQL Editor');
    } else {
      console.log('✅ Users table exists and accessible');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabase();
