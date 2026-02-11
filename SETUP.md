# AI Form Builder - Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud database)
- **Git** - [Download](https://git-scm.com/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

---

## Project Structure

```
Survey and Form Builder/
├── Backend/
│   ├── src/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── vite.config.ts
├── SETUP.md
└── README.md
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd Backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/formbuilder
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/formbuilder

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Step 4: Start MongoDB
If using local MongoDB:
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

If using MongoDB Atlas, skip this step.

### Step 5: Build Backend
```bash
npm run build
```

### Step 6: Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend should now be running on `http://localhost:5000`

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory
Open a new terminal window:
```bash
cd Frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
Create a `.env` file in the `Frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=FormBuilder AI
```

### Step 4: Build Frontend
```bash
npm run build
```

### Step 5: Start Frontend Development Server
```bash
npm run dev
```

Frontend should now be running on `http://localhost:5173`

---

## Environment Configuration

### Backend Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/formbuilder` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Running the Application

### Development Mode

1. **Start Backend** (Terminal 1):
```bash
cd Backend
npm run dev
```

2. **Start Frontend** (Terminal 2):
```bash
cd Frontend
npm run dev
```

3. **Access Application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`

### Production Mode

1. **Build Backend**:
```bash
cd Backend
npm run build
npm start
```

2. **Build Frontend**:
```bash
cd Frontend
npm run build
npm run preview
```

---

## Testing the Application

### 1. Register a New User
- Navigate to `http://localhost:5173/register`
- Create an account with email and password

### 2. Create a Form
- Login and go to Dashboard
- Click "Create New Form"
- Enter form details and add fields
- Use AI generation by entering a purpose

### 3. Share Form
- After creating a form, click "Share"
- Copy the public URL
- Open in incognito/private window to test submission

### 4. View Analytics
- Go to Dashboard
- Click "Analytics" on any form
- View responses and statistics
- Export to Excel

---

## Troubleshooting

### Backend Issues

**Problem: MongoDB connection error**
```
Solution:
1. Ensure MongoDB is running
2. Check MONGODB_URI in .env
3. For Atlas, verify network access and credentials
```

**Problem: OpenAI API error**
```
Solution:
1. Verify OPENAI_API_KEY is correct
2. Check API key has credits
3. Ensure API key has proper permissions
```

**Problem: Port already in use**
```
Solution:
1. Change PORT in .env to different number (e.g., 5001)
2. Update VITE_API_URL in Frontend .env accordingly
```

### Frontend Issues

**Problem: API connection error**
```
Solution:
1. Verify backend is running
2. Check VITE_API_URL matches backend PORT
3. Check browser console for CORS errors
```

**Problem: Build errors**
```
Solution:
1. Delete node_modules and package-lock.json
2. Run: npm install
3. Run: npm run build
```

**Problem: Dark mode not working**
```
Solution:
1. Clear browser cache
2. Check localStorage for 'theme' key
3. Hard refresh (Ctrl+Shift+R)
```

### Common Issues

**Problem: File upload fails**
```
Solution:
1. Check uploads/ directory exists in Backend
2. Verify MAX_FILE_SIZE in .env
3. Check file type is allowed
```

**Problem: JWT token expired**
```
Solution:
1. Logout and login again
2. Check JWT_EXPIRES_IN in .env
3. Clear browser localStorage
```

---

## Database Setup (MongoDB Atlas)

If using MongoDB Atlas instead of local MongoDB:

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Choose free tier
3. **Create Database User**: Set username and password
4. **Whitelist IP**: Add `0.0.0.0/0` for development (all IPs)
5. **Get Connection String**: 
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
6. **Update .env**: Paste connection string in `MONGODB_URI`

---

## Additional Configuration

### Changing File Upload Limits

Edit `Backend/src/config/upload.ts`:
```typescript
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['.pdf', '.jpg', '.png', '.doc', '.docx']
};
```

### Customizing JWT Expiration

Edit `Backend/.env`:
```env
JWT_EXPIRES_IN=30d  # 30 days
# or
JWT_EXPIRES_IN=24h  # 24 hours
```

### Enabling HTTPS (Production)

For production deployment:
1. Obtain SSL certificate
2. Update `FRONTEND_URL` to use `https://`
3. Configure reverse proxy (nginx/Apache)

---

## Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables in platform dashboard
2. Ensure `NODE_ENV=production`
3. Update `FRONTEND_URL` to production URL
4. Deploy from Git repository

### Frontend Deployment (Vercel/Netlify)

1. Connect Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy

---

## Quick Start Commands

```bash
# Clone repository
git clone <repository-url>
cd "Survey and Form Builder"

# Setup Backend
cd Backend
npm install
# Create .env file with required variables
npm run dev

# Setup Frontend (new terminal)
cd Frontend
npm install
# Create .env file with required variables
npm run dev

# Access application at http://localhost:5173
```

---

## Features Overview

### Core Features
- ✅ User Authentication (Register/Login/Logout)
- ✅ JWT-based Authorization
- ✅ AI-Powered Form Generation (OpenAI Integration)
- ✅ Drag & Drop Field Management
- ✅ Multiple Field Types (Text, Email, Textarea, Select, Radio, Checkbox, Date, Rating, File)
- ✅ Email Field Validation
- ✅ Duplicate Submission Prevention
- ✅ Auto-save Drafts (localStorage)
- ✅ Public Form Sharing
- ✅ File Upload Support
- ✅ Real-time Response Collection
- ✅ Analytics Dashboard
- ✅ Export to Excel
- ✅ Pagination for Large Datasets
- ✅ Dark Mode Support
- ✅ Responsive Design
- ✅ Fixed Alert Notifications

### Technical Highlights
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: OpenAI GPT for intelligent form generation
- **File Handling**: Multer for file uploads
- **Data Export**: XLSX for Excel export
- **State Management**: React Context API
- **Form Management**: react-grid-layout for drag & drop

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review error logs in terminal
- Check browser console for frontend errors
- Verify all environment variables are set correctly

---

**Note**: Make sure to replace placeholder values (API keys, secrets, etc.) with your actual credentials before running the application.

**Security Warning**: Never commit `.env` files to version control. Add them to `.gitignore`.
