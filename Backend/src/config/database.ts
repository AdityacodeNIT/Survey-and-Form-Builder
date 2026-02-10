import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

interface ConnectionOptions {
  maxRetries?: number;
  retryInterval?: number;
}

/**
 * Connect to MongoDB with retry logic
 */
export const connectDatabase = async (
  options: ConnectionOptions = {}
): Promise<void> => {
  const { maxRetries = MAX_RETRIES, retryInterval = RETRY_INTERVAL } = options;
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  let retries = 0;

  const connect = async (): Promise<void> => {
    try {
      await mongoose.connect(mongoUri);
      logger.info('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected successfully');
      });

    } catch (error) {
      retries++;
      logger.error(`MongoDB connection failed (attempt ${retries}/${maxRetries}):`, error);

      if (retries < maxRetries) {
        logger.info(`Retrying connection in ${retryInterval / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
        return connect();
      } else {
        logger.error('Max retries reached. Could not connect to MongoDB.');
        throw new Error('Failed to connect to MongoDB after multiple attempts');
      }
    }
  };

  await connect();
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Get connection status
 */
export const getConnectionStatus = (): string => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};
