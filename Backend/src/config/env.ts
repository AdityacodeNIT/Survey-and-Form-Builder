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
  claudeApiKey: string;
  corsOrigin: string;
}

/**
 * Validate required environment variables
 */
const validateEnv = (): void => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLAUDE_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
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
    claudeApiKey: process.env.CLAUDE_API_KEY!,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  };
};

export const config = getEnvConfig();
