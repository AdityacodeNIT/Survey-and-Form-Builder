#  AI-Generated Survey and Form Builder

A modern, full-stack web application that enables users to create, manage, and analyze surveys and forms with AI-powered question generation. Built with React, Node.js, and integrated with Groq/Claude AI for intelligent form creation.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
[![License](https://img.shields.io/github/license/AdityaCodeNIT/Survey-and-Form-Builder)](./LICENSE)


## ✨ Features

- 🤖 **AI-Powered Question Generation** - Generate relevant questions using Groq or Claude AI
- 📝 **Intuitive Form Builder** - Create forms with text, textarea, and select field types
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔐 **Secure Authentication** - JWT-based authentication with Argon2 password hashing
- 📊 **Real-time Analytics** - Track responses and view statistics
- 🔗 **Shareable Links** - Publish forms and share via unique URLs
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast & Efficient** - Built with Vite for lightning-fast development

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router 7** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js 18+** - Runtime environment
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose 9** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Argon2** - Password hashing
- **Winston** - Logging
- **Groq SDK** - AI integration (free tier)
- **Anthropic SDK** - Claude AI integration (added functionality but do not added fully to avoid the issues)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- **Groq API Key** - Free tier available at [Groq Console](https://console.groq.com/)
- **Claude API Key** (Optional) - From [Anthropic](https://www.anthropic.com/)

##  Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-survey-form-builder
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration (see Configuration section below)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Provider Configuration
# Choose 'groq' (free) or 'anthropic' (paid)
AI_PROVIDER=groq

# Groq API (Free tier available)
GROQ_API_KEY=your-groq-api-key-here

# Claude API (Optional - if using Anthropic)
CLAUDE_API_KEY=your-claude-api-key-here

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `Frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Getting API Keys

#### Groq API Key (Free - Recommended)
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into your `.env` file

#### Claude API Key (Optional)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up and add payment method
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into your `.env` file

#### MongoDB Atlas (Free Tier)
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string
7. Replace `<username>`, `<password>`, and `<database-name>` in the connection string

## 📁 Project Structure

```
ai-survey-form-builder/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # MongoDB connection
│   │   │   └── env.ts                # Environment variables
│   │   ├── middleware/
│   │   │   └── errorHandler.ts      # Global error handler
│   │   ├── modules/
│   │   │   ├── auth/                # Authentication module
│   │   │   │   ├── controllers/
│   │   │   │   ├── middleware/
│   │   │   │   ├── models/
│   │   │   │   ├── routes/
│   │   │   │   └── services/
│   │   │   ├── forms/               # Forms management
│   │   │   ├── responses/           # Response collection
│   │   │   └── ai/                  # AI integration
│   │   ├── utils/
│   │   │   ├── apiError.ts          # Error utilities
│   │   │   ├── apiResponse.ts       # Response utilities
│   │   │   ├── asyncHandler.ts      # Async wrapper
│   │   │   └── logger.ts            # Winston logger
│   │   ├── app.ts                   # Express app setup
│   │   └── index.ts                 # Server entry point
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.tsx           # Navigation component
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Landing page
│   │   │   ├── LoginPage.tsx        # Login page
│   │   │   ├── RegisterPage.tsx     # Registration page
│   │   │   ├── DashboardPage.tsx    # User dashboard
│   │   │   ├── FormBuilderPage.tsx  # Form builder
│   │   │   ├── PublicFormPage.tsx   # Public form view
│   │   │   └── AnalyticsPage.tsx    # Analytics view
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Authentication context
│   │   ├── services/
│   │   │   └── api.ts               # Axios configuration
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript types
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Tailwind CSS
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── tsconfig.json
│
└── README.md
```

## 🎯 Usage

### Creating Your First Form

1. **Register an Account**
   - Navigate to http://localhost:5173
   - Click "Get Started" or "Register"
   - Fill in your details and create an account

2. **Create a Form**
   - Go to Dashboard
   - Click "Create New Form"
   - Enter form title, description, and purpose
   - Add fields manually or use AI suggestions

3. **Use AI Suggestions**
   - Enter a form purpose (e.g., "Employee satisfaction survey")
   - Click "Get AI Suggestions"
   - Review and add suggested questions to your form

4. **Publish Your Form**
   - Click "Save" to save your form
   - Click "Publish" to make it available
   - Copy the shareable link

5. **Share and Collect Responses**
   - Share the public link with respondents
   - Responses are collected automatically

6. **View Analytics**
   - Go to Dashboard
   - Click "Analytics" on your form
   - View response count and statistics

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Forms (Protected)
- `POST /api/forms` - Create new form
- `GET /api/forms` - Get user's forms
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `POST /api/forms/:id/publish` - Publish form
- `POST /api/forms/:id/unpublish` - Unpublish form

### AI (Protected)
- `POST /api/ai/suggestions` - Get AI-generated questions

### Responses (Public)
- `POST /api/forms/:id/responses` - Submit response
- `GET /api/forms/:id/responses` - Get form responses (Protected)
- `GET /api/forms/:id/analytics` - Get analytics (Protected)

### Public
- `GET /api/public/forms/:shareableUrl` - Get published form

## 🧪 Testing

### Run Complete Flow Test

```bash
cd Backend
powershell -ExecutionPolicy Bypass -File test-complete-flow.ps1
```

This test validates:
- User registration and login
- Form creation and updates
- AI suggestions
- Form publishing
- Response submission
- Analytics retrieval
- Dashboard access

### Manual Testing

1. **Test Authentication**
   - Register a new user
   - Login with credentials
   - Verify JWT token is stored
   - Test logout functionality

2. **Test Form Creation**
   - Create a form with multiple fields
   - Save and verify it appears in dashboard
   - Edit the form and save changes

3. **Test AI Integration**
   - Request AI suggestions
   - Verify suggestions are displayed
   - Add suggestions to form

4. **Test Public Forms**
   - Publish a form
   - Access the public URL
   - Submit a response
   - Verify response is saved

5. **Test Analytics**
   - View analytics for a form
   - Verify response count is correct
   - Check field statistics

##  Building for Production

### Backend

```bash
cd Backend

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Frontend

```bash
cd Frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

The production build will be in the `Frontend/dist` directory.

##  Troubleshooting

### Common Issues

**Issue: MongoDB connection fails**
- Verify your MongoDB URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure MongoDB service is running (if local)

**Issue: AI suggestions not working**
- Verify your API key is correct
- Check if you have API credits (for Claude)
- Groq has a free tier - ensure you're using it
- Check the `AI_PROVIDER` environment variable

**Issue: Tailwind styles not showing**
- Clear browser cache (Ctrl+Shift+R)
- Restart the Vite dev server
- Verify `index.css` is imported in `main.tsx`

**Issue: CORS errors**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check if backend server is running
- Ensure ports are correct (5000 for backend, 5173 for frontend)

**Issue: JWT token errors**
- Clear localStorage in browser
- Login again to get a new token
- Verify `JWT_SECRET` is set in backend `.env`

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is licensed under the ISC License.

## 👤 Author

**Aditya Srivastav**

## 🙏 Acknowledgments

- [Groq](https://groq.com/) - For providing free AI API access
- [Anthropic](https://www.anthropic.com/) - For Claude AI
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For free database hosting
- [Tailwind CSS](https://tailwindcss.com/) - For the amazing CSS framework
- [Vite](https://vitejs.dev/) - For the blazing fast build tool

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the test scripts in the `Backend` directory

---

**Built with ❤️ using React, Node.js, and AI**
