import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  aiProvider: string;
  claudeApiKey?: string;
  groqApiKey?: string;
  corsOrigin: string;
}

/**
 * Validate required environment variables
 */
const validateEnv = (): void => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Check AI provider configuration
  const aiProvider = process.env.AI_PROVIDER || 'groq';
  if (aiProvider === 'groq' && !process.env.GROQ_API_KEY) {
    logger.warn('GROQ_API_KEY not set. AI features will not work.');
  }
  if (aiProvider === 'anthropic' && !process.env.CLAUDE_API_KEY) {
    logger.warn('CLAUDE_API_KEY not set. AI features will not work.');
  }
};

/**
 * Get environment configuration
 */
export const getEnvConfig = (): EnvConfig => {
  validateEnv();

  return {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    aiProvider: process.env.AI_PROVIDER || 'groq',
    claudeApiKey: process.env.CLAUDE_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  };
};

export const config = getEnvConfig();
