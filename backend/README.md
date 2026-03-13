# LandInvest Backend API

A comprehensive Node.js backend API for the LandInvest platform built with Express and Supabase.

## 🚀 Features

- **Authentication**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Listings Management**: CRUD operations for land listings
- **Investments**: Investment creation and tracking
- **File Upload**: Secure file upload with validation
- **Rate Limiting**: Protection against abuse
- **Security**: Helmet, CORS, input validation
- **Database**: Supabase PostgreSQL integration

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase project
- Environment variables configured

## 🛠️ Installation

1. **Clone and install dependencies**:
```bash
cd backend
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. **Initialize database**:
```bash
# The database schema will be created automatically on first run
npm start
```

## 🔧 Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `full_name` (VARCHAR)
- `role` (ENUM: investor, project_owner)
- `is_approved` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### Listings Table
- `id` (UUID, Primary Key)
- `title`, `description`, `location` (VARCHAR/TEXT)
- `target_amount` (DECIMAL)
- `fractions` (INTEGER)
- `duration_days`, `max_days`, `days_left` (INTEGER)
- `status` (ENUM: active, closed, funded)
- `progress` (INTEGER, 0-100)
- `owner_id` (Foreign Key to users)
- `created_at`, `updated_at` (TIMESTAMP)

### Investments Table
- `id` (UUID, Primary Key)
- `listing_id` (Foreign Key to listings)
- `investor_id` (Foreign Key to users)
- `fractions` (INTEGER)
- `amount` (DECIMAL)
- `status` (ENUM: pending, confirmed, completed)
- `created_at`, `updated_at` (TIMESTAMP)

### Listing Media Table
- `id` (UUID, Primary Key)
- `listing_id` (Foreign Key to listings)
- `file_name`, `file_path` (VARCHAR)
- `file_type` (ENUM: image, video)
- `file_size` (BIGINT)
- `mime_type` (VARCHAR)
- `created_at` (TIMESTAMP)

## 🛡️ API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /verify` - Token verification
- `POST /refresh` - Token refresh

### Users (`/api/users`)
- `GET /profile` - Get user profile (auth required)
- `PUT /profile` - Update user profile (auth required)
- `PUT /password` - Change password (auth required)
- `GET /` - Get all users (admin only)
- `PUT /:userId/approve` - Approve project owner (admin only)

### Listings (`/api/listings`)
- `GET /` - Get all listings (public)
- `GET /:id` - Get single listing (public)
- `POST /` - Create listing (project owner only)
- `PUT /:id` - Update listing (owner only)
- `PUT /:id/extend` - Extend listing duration (owner only)
- `DELETE /:id` - Delete listing (owner only)
- `GET /my-listings` - Get user's listings (auth required)

### Investments (`/api/investments`)
- `GET /` - Get all investments (public)
- `GET /my-investments` - Get user's investments (auth required)
- `POST /` - Create investment (investor only)
- `PUT /:id/confirm` - Confirm investment (investor only)
- `GET /listing/:listingId` - Get investments for listing (public)

### Upload (`/api/upload`)
- `POST /listing/:listingId` - Upload files for listing (auth required)
- `DELETE /file/:fileId` - Delete uploaded file (auth required)
- `GET /listing/:listingId` - Get files for listing (auth required)
- `GET /serve/:filename` - Serve uploaded file (auth required)

## 🏃‍♂️ Running the Server

### Development
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Production
```bash
npm start
# Server runs on specified PORT
```

## 📝 Example API Usage

### Register User
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    fullName: 'John Doe',
    role: 'investor'
  })
});
```

### Create Listing
```javascript
const response = await fetch('http://localhost:5000/api/listings', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    title: 'Land in Bomaka',
    location: 'Bomaka, Buea',
    description: 'Fertile land suitable for agriculture',
    targetAmount: 20000000,
    fractions: 20,
    duration: 90
  })
});
```

### Upload Files
```javascript
const formData = new FormData();
formData.append('files', fileInput.files[0]);

const response = await fetch('http://localhost:5000/api/upload/listing/LISTING_ID', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' },
  body: formData
});
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds (12)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers for Express apps
- **File Upload Security**: Type and size validation

## 📊 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "errors": [ ... ] // For validation errors
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure Supabase production credentials
3. Deploy to your hosting provider
4. Ensure CORS origins are properly configured

## 📞 Support

For issues and questions:
- Check the logs for detailed error information
- Verify environment variables are correctly set
- Ensure Supabase connection is working
- Check API response formats for proper handling

## 🔄 Development Workflow

1. Make changes to code
2. Test with `npm run dev`
3. Commit changes
4. Deploy to production
5. Monitor logs and performance
