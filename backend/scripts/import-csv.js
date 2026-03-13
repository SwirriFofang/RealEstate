const fs = require('fs');
const path = require('path');
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

// Parse CSV file
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

// Import CSV data to Supabase
async function importCSVData() {
  try {
    console.log('🚀 Starting CSV import to Supabase...\n');

    // Import Users
    console.log('📥 Importing users...');
    const usersData = parseCSV('./csv/users.csv');
    
    for (const user of usersData) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          password_hash: user.password_hash,
          full_name: user.full_name,
          role: user.role,
          is_approved: user.is_approved === 'true',
          created_at: user.created_at,
          updated_at: user.updated_at
        });

      if (error) {
        console.error(`❌ Error inserting user ${user.email}:`, error.message);
      } else {
        console.log(`✅ User inserted: ${user.email}`);
      }
    }

    // Import Listings
    console.log('\n📥 Importing listings...');
    const listingsData = parseCSV('./csv/listings.csv');
    
    for (const listing of listingsData) {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          location: listing.location,
          target_amount: parseFloat(listing.target_amount),
          fractions: parseInt(listing.fractions),
          duration_days: parseInt(listing.duration_days),
          max_days: parseInt(listing.max_days),
          days_left: parseInt(listing.days_left),
          status: listing.status,
          progress: parseInt(listing.progress),
          owner_id: listing.owner_id,
          created_at: listing.created_at,
          updated_at: listing.updated_at
        });

      if (error) {
        console.error(`❌ Error inserting listing ${listing.title}:`, error.message);
      } else {
        console.log(`✅ Listing inserted: ${listing.title}`);
      }
    }

    // Import Investments
    console.log('\n📥 Importing investments...');
    const investmentsData = parseCSV('./csv/investments.csv');
    
    for (const investment of investmentsData) {
      const { data, error } = await supabase
        .from('investments')
        .insert({
          id: investment.id,
          listing_id: investment.listing_id,
          investor_id: investment.investor_id,
          fractions: parseInt(investment.fractions),
          amount: parseFloat(investment.amount),
          status: investment.status,
          created_at: investment.created_at,
          updated_at: investment.updated_at
        });

      if (error) {
        console.error(`❌ Error inserting investment ${investment.id}:`, error.message);
      } else {
        console.log(`✅ Investment inserted: ${investment.id}`);
      }
    }

    // Import Listing Media
    console.log('\n📥 Importing listing media...');
    const mediaData = parseCSV('./csv/listing_media.csv');
    
    for (const media of mediaData) {
      const { data, error } = await supabase
        .from('listing_media')
        .insert({
          id: media.id,
          listing_id: media.listing_id,
          file_name: media.file_name,
          file_path: media.file_path,
          file_type: media.file_type,
          file_size: parseInt(media.file_size),
          mime_type: media.mime_type,
          created_at: media.created_at
        });

      if (error) {
        console.error(`❌ Error inserting media ${media.file_name}:`, error.message);
      } else {
        console.log(`✅ Media inserted: ${media.file_name}`);
      }
    }

    console.log('\n🎉 CSV import completed!');
    
    // Verify data
    console.log('\n📊 Verifying imported data...');
    
    const { data: users, error: usersError } = await supabase.from('users').select('count');
    const { data: listings, error: listingsError } = await supabase.from('listings').select('count');
    const { data: investments, error: investmentsError } = await supabase.from('investments').select('count');
    const { data: media, error: mediaError } = await supabase.from('listing_media').select('count');

    console.log(`✅ Users: ${users?.[0]?.count || 0}`);
    console.log(`✅ Listings: ${listings?.[0]?.count || 0}`);
    console.log(`✅ Investments: ${investments?.[0]?.count || 0}`);
    console.log(`✅ Media files: ${media?.[0]?.count || 0}`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

// Run the import
importCSVData();
