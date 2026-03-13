const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL schema
const schemaSQL = fs.readFileSync('./schema.sql', 'utf8');

// Read and parse CSV files
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }

  return data;
}

// Create tables and import data
async function createAndImport() {
  try {
    console.log('🚀 Creating tables and importing data...\n');

    // Step 1: Read the schema SQL
    console.log('📋 Schema SQL loaded successfully');

    // Step 2: Parse CSV data
    const usersData = parseCSV('./csv/users.csv');
    const listingsData = parseCSV('./csv/listings.csv');
    const investmentsData = parseCSV('./csv/investments.csv');
    const mediaData = parseCSV('./csv/listing_media.csv');

    console.log(`📊 Parsed ${usersData.length} users, ${listingsData.length} listings, ${investmentsData.length} investments, ${mediaData.length} media files`);

    // Step 3: Generate complete SQL with INSERT statements
    let completeSQL = schemaSQL + '\n\n';

    // Add INSERT statements for users
    completeSQL += '-- Insert Users Data\n';
    usersData.forEach(user => {
      completeSQL += `INSERT INTO users (id, email, password_hash, full_name, role, is_approved, created_at, updated_at) VALUES ('${user.id}', '${user.email}', '${user.password_hash}', '${user.full_name}', '${user.role}', ${user.is_approved}, '${user.created_at}', '${user.updated_at}');\n`;
    });

    // Add INSERT statements for listings
    completeSQL += '\n-- Insert Listings Data\n';
    listingsData.forEach(listing => {
      completeSQL += `INSERT INTO listings (id, title, description, location, target_amount, fractions, duration_days, max_days, days_left, status, progress, owner_id, created_at, updated_at) VALUES ('${listing.id}', '${listing.title}', '${listing.description}', '${listing.location}', ${listing.target_amount}, ${listing.fractions}, ${listing.duration_days}, ${listing.max_days}, ${listing.days_left}, '${listing.status}', ${listing.progress}, '${listing.owner_id}', '${listing.created_at}', '${listing.updated_at}');\n`;
    });

    // Add INSERT statements for investments
    completeSQL += '\n-- Insert Investments Data\n';
    investmentsData.forEach(investment => {
      completeSQL += `INSERT INTO investments (id, listing_id, investor_id, fractions, amount, status, created_at, updated_at) VALUES ('${investment.id}', '${investment.listing_id}', '${investment.investor_id}', ${investment.fractions}, ${investment.amount}, '${investment.status}', '${investment.created_at}', '${investment.updated_at}');\n`;
    });

    // Add INSERT statements for media
    completeSQL += '\n-- Insert Listing Media Data\n';
    mediaData.forEach(media => {
      completeSQL += `INSERT INTO listing_media (id, listing_id, file_name, file_path, file_type, file_size, mime_type, created_at) VALUES ('${media.id}', '${media.listing_id}', '${media.file_name}', '${media.file_path}', '${media.file_type}', ${media.file_size}, '${media.mime_type}', '${media.created_at}');\n`;
    });

    // Save complete SQL to file
    fs.writeFileSync('./complete-setup.sql', completeSQL);
    console.log('💾 Complete SQL script saved to ./complete-setup.sql');

    console.log('\n📝 To complete the setup:');
    console.log('1. Go to: https://supabase.com/dashboard/project/kepokcjvjwmtxdnfoijn/sql');
    console.log('2. Copy the content from ./complete-setup.sql');
    console.log('3. Paste and execute in the SQL Editor');
    console.log('4. This will create tables AND insert all sample data');

    console.log('\n🎯 Alternative: Use the SQL below to create tables first:');
    console.log('```sql');
    console.log(schemaSQL);
    console.log('```');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
createAndImport();
