# Setup Guide

Hey! This guide will help you get the AI Form Builder running on your machine. It's pretty straightforward, but make sure you follow each step.

## What You'll Need

Before we start, make sure you have these installed:

- Node.js (version 18 or newer)
- npm (comes with Node.js)
- A MongoDB Atlas account (it's free)
- Groq API key (also free!)

## Project Layout

Here's how the project is organized:

```
Backend/
  - src/
    - config/       (database and env setup)
    - middleware/   (auth and error handling)
    - modules/      (auth, forms, responses, ai, uploads)
    - utils/        (helper functions)
  - uploads/        (where uploaded files go)
  - .env
  - package.json

Frontend/
  - src/
    - components/   (Navbar and stuff)
    - pages/        (all the pages)
    - context/      (auth and theme)
    - services/     (API calls)
    - types/        (TypeScript types)
  - .env
  - package.json
```

## Getting Started

### Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd ai-form-builder
```

### Step 2: Backend Setup

```bash
cd Backend
npm install
```

Now create a `.env` file in the Backend folder:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority

JWT_SECRET=put-a-really-long-random-string-here
JWT_EXPIRES_IN=7d

AI_PROVIDER=groq
GROQ_API_KEY=your-groq-key-here

# Only if you want to use Claude instead
CLAUDE_API_KEY=your-claude-key-here

CORS_ORIGIN=http://localhost:5173
```

### Step 3: Frontend Setup

```bash
cd ../Frontend
npm install
```

Create a `.env` file in the Frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

## Getting Your API Keys

### MongoDB (Required)

1. Go to mongodb.com/cloud/atlas and sign up
2. Create a new cluster (pick the free M0 tier)
3. Add a database user under "Database Access"
4. Under "Network Access", add your IP (or just use 0.0.0.0/0 for testing)
5. Click "Connect" and grab your connection string
6. Replace username, password, and database-name in your .env

### Groq API (Required)

1. Head to console.groq.com
2. Sign up (it's free)
3. Go to API Keys and create one
4. Copy it to your .env file

### JWT Secret (Required)

Just run this to generate a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to JWT_SECRET in your .env

### Claude API (Optional)

Only needed if you want to use Claude instead of Groq:
1. Go to console.anthropic.com
2. Sign up and add payment info
3. Create an API key
4. Set AI_PROVIDER=anthropic in your .env

## Running the App

You need two terminal windows open:

**Terminal 1 (Backend):**
```bash
cd Backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
```

The app should now be running at http://localhost:5173

## What's Included

The form builder has:
- Drag and drop to reorder fields
- 9 different field types (text, email, textarea, select, radio, checkbox, date, rating, file upload)
- AI-powered question suggestions
- Auto-save so you don't lose your work
- Works great on mobile
- Email validation and duplicate prevention
- File uploads with validation
- Dark mode
- Analytics with charts and export to Excel

## Quick Test

1. Open http://localhost:5173
2. Register a new account
3. Create a form and add some fields
4. Try the AI suggestions (just enter what the form is for)
5. Save and publish your form
6. Copy the link and open it in a private window
7. Fill it out and submit
8. Check the analytics page

## Common Problems

**Can't connect to MongoDB**
- Double check your connection string
- Make sure you whitelisted your IP in MongoDB Atlas
- Try using 0.0.0.0/0 for the IP whitelist (just for testing)

**Port 5000 is already taken**
- Change PORT in Backend/.env to something else like 5001
- Update VITE_API_URL in Frontend/.env to match

**AI suggestions aren't working**
- Make sure your GROQ_API_KEY is correct
- Check that AI_PROVIDER is set to "groq"

**Styles look broken**
- Try a hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
- Restart the frontend dev server

**API calls failing**
- Make sure the backend is actually running
- Check VITE_API_URL in Frontend/.env
- Look for CORS errors in the browser console

## Building for Production

**Backend:**
```bash
cd Backend
npm run build
npm start
```

**Frontend:**
```bash
cd Frontend
npm run build
```

The built files will be in Frontend/dist

## Main Dependencies

Backend uses:
- Express for the server
- Mongoose for MongoDB
- JWT for auth
- Argon2 for password hashing
- Groq SDK for AI
- Multer for file uploads

Frontend uses:
- React 19
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- react-grid-layout for drag and drop
- XLSX for Excel exports

## Deployment Tips

For the backend (Railway, Render, etc):
- Set all your environment variables
- Use your production MongoDB URI
- Update CORS_ORIGIN to your frontend URL

For the frontend (Vercel, Netlify, etc):
- Set VITE_API_URL to your backend URL
- Build command: npm run build
- Output directory: dist

## Need Help?

If something's not working:
1. Check the error messages in your terminal
2. Look at the browser console
3. Make sure all environment variables are set
4. Try deleting node_modules and running npm install again
5. Hard refresh your browser

## License

MIT

## Author

Aditya Srivastav
