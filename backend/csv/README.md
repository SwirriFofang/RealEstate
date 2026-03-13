# Supabase CSV Import Guide

## 📁 CSV Files Available

### 1. users.csv
- **Records**: 3 sample users
- **Users**: Admin, Investor, Project Owner
- **Status**: All pre-approved for testing

### 2. listings.csv  
- **Records**: 3 sample properties
- **Locations**: Miami Beach, New York City, Denver
- **Status**: All active listings

### 3. investments.csv
- **Records**: 3 sample investments
- **Status**: All pending (awaiting confirmation)

### 4. listing_media.csv
- **Records**: 6 sample media files
- **Types**: Images and videos for listings

## 🚀 Import Instructions

### Step 1: Create Tables First
Before importing CSV files, you must create the tables using the SQL schema:

1. Go to: https://supabase.com/dashboard/project/kepokcjvjwmtxdnfoijn/sql
2. Run the table creation SQL from `../schema.sql`

### Step 2: Import CSV Files

#### Method A: Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/kepokcjvjwmtxdnfoijn
2. Click on "Table Editor" in the left sidebar
3. Select each table and click "Import"
4. Choose the corresponding CSV file
5. Map columns (they should match automatically)
6. Click "Import"

#### Method B: CSV Import via API
```sql
-- For each table, run:
COPY users FROM 'https://your-csv-location/users.csv' WITH (FORMAT csv, HEADER true);
COPY listings FROM 'https://your-csv-location/listings.csv' WITH (FORMAT csv, HEADER true);
COPY investments FROM 'https://your-csv-location/investments.csv' WITH (FORMAT csv, HEADER true);
COPY listing_media FROM 'https://your-csv-location/listing_media.csv' WITH (FORMAT csv, HEADER true);
```

## 📊 Import Order
Import in this sequence to avoid foreign key errors:

1. **users.csv** (first - no dependencies)
2. **listings.csv** (depends on users)
3. **investments.csv** (depends on users and listings)
4. **listing_media.csv** (depends on listings)

## 🔐 Sample Login Credentials

After importing, you can test with these accounts:

### Admin User
- **Email**: admin@landinvest.com
- **Password**: password123
- **Role**: admin

### Investor User  
- **Email**: investor@example.com
- **Password**: password123
- **Role**: investor

### Project Owner User
- **Email**: owner@example.com
- **Password**: password123
- **Role**: project_owner

## ⚠️ Important Notes

- **Password Hash**: All users use the same hash for "password123"
- **UUIDs**: Sample UUIDs are used - they won't conflict with real data
- **File Paths**: Media paths are placeholders - update with actual file locations
- **Timestamps**: All set to 2024-01-01 for consistency

## 🧪 Testing After Import

Once imported, test your backend:

```bash
# Test database connection
npm run init-db

# Start server
npm start

# Test endpoints
curl http://localhost:5000/api/health
```

## 📝 Data Overview

- **3 Users** (1 admin, 1 investor, 1 project owner)
- **3 Listings** (beach, commercial, mountain properties)
- **3 Investments** (pending investments in listings)
- **6 Media Files** (images and videos for listings)

This sample data provides a complete testing environment for your LandInvest platform!
