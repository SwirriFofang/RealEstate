# LandInvest - Real Estate Investment Platform

A comprehensive real estate investment platform connecting investors with property owners using Node.js backend, React frontend, and Supabase database.

## 🏗️ Architecture

### **Frontend (React + Vite)**
- **Location**: `./frontend/` (root directory)
- **Tech Stack**: React, Vite, TailwindCSS, Lucide Icons
- **Features**: User authentication, property listings, investments, file uploads

### **Backend (Node.js + Express)**
- **Location**: `./backend/`
- **Tech Stack**: Node.js, Express, Supabase, JWT, Multer
- **Features**: RESTful API, authentication, CRUD operations, file management

### **Database (Supabase)**
- **Provider**: Supabase (PostgreSQL)
- **Connection**: Session Pooler
- **Features**: User management, property listings, investments, media storage

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v18+)
- Supabase account
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/SwirriFofang/RealEstate.git
cd RealEstate
```

### **2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure your Supabase credentials
npm start
# Backend runs on http://localhost:5000
```

### **3. Frontend Setup**
```bash
# From root directory
npm install
npm start
# Frontend runs on http://localhost:5173
```

### **4. Database Setup**
1. Go to your Supabase project SQL Editor
2. Run the SQL from `backend/complete-setup.sql`
3. This creates all tables and inserts sample data

## 📊 Database Schema

### **Tables**
- **users** - User accounts and roles
- **listings** - Property listings
- **investments** - Investment records
- **listing_media** - Property images/videos

### **Sample Data**
- 3 Users (admin, investor, project owner)
- 3 Property listings
- 3 Sample investments
- 6 Media files

## 🔐 Authentication

### **Test Credentials**
- **Admin**: admin@landinvest.com / password123
- **Investor**: investor@example.com / password123
- **Owner**: owner@example.com / password123

### **User Roles**
- **admin** - Full system access
- **investor** - Can view and invest in properties
- **project_owner** - Can create and manage listings

## 🛠️ Available Scripts

### **Backend Scripts**
```bash
npm start              # Start production server
npm run dev            # Start development server
npm run init-db        # Initialize database connection
npm run import-csv     # Import CSV data
npm run create-and-import  # Generate complete SQL setup
npm run test-api       # Test API endpoints
```

### **Frontend Scripts**
```bash
npm start              # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

## 📁 Project Structure

```
RealEstate/
├── backend/                    # Node.js backend
│   ├── config/                # Database configuration
│   ├── csv/                   # Sample data files
│   ├── middleware/            # Authentication middleware
│   ├── routes/                # API routes
│   ├── scripts/               # Utility scripts
│   └── uploads/               # File upload directory
├── src/                       # React frontend
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts
│   ├── pages/                 # Page components
│   └── services/              # API services
├── public/                    # Static assets
└── README.md                  # This file
```

## 🔗 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Users**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### **Listings**
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create listing
- `GET /api/listings/:id` - Get specific listing

### **Investments**
- `GET /api/investments` - Get investments
- `POST /api/investments` - Create investment

### **File Upload**
- `POST /api/upload/listing/:id` - Upload listing media

## 🌟 Features

### **For Investors**
- Browse property listings
- Make investments
- Track investment performance
- View investment history

### **For Property Owners**
- Create property listings
- Upload property media
- Manage investments
- Track listing performance

### **For Administrators**
- User management
- Content moderation
- System monitoring

## 🔧 Configuration

### **Environment Variables (.env)**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Connection
POSTGRES_URL=your_postgres_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production
```

## 🚀 Deployment

### **Backend Deployment**
1. Set environment variables
2. Install dependencies: `npm install --production`
3. Start server: `npm start`

### **Frontend Deployment**
1. Build: `npm run build`
2. Deploy `dist/` folder to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue on GitHub.

---

**Built with ❤️ by LandInvest Team**
