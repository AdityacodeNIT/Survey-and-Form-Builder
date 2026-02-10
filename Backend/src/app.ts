import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRoutes } from './modules/auth/index.js';
import { formRoutes } from './modules/forms/index.js';
import { aiRoutes } from './modules/ai/index.js';
import { responseRoutes } from './modules/responses/index.js';
import { getPublicForm } from './modules/forms/controllers/formController.js';
import { asyncHandler } from './utils/index.js';
import uploadRoutes from './modules/uploads/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Public form endpoint (no authentication required)
app.get('/api/public/forms/:shareableUrl', getPublicForm);

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount response routes BEFORE form routes (more specific paths match first)
app.use('/api/forms', responseRoutes);

// Mount form routes
app.use('/api/forms', formRoutes);

// Mount AI routes
app.use('/api/ai', aiRoutes);

// Mount upload routes
app.use('/api/upload', uploadRoutes);

// 404 handler for unknown routes (must be after all other routes)
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;


