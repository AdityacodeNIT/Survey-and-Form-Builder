import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    const PORT = config.port;
    const HOST = '0.0.0.0'; // Bind to all network interfaces for Render
    
    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on ${HOST}:${PORT} in ${config.nodeEnv} mode`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          const { disconnectDatabase } = await import('./config/database.js');
          await disconnectDatabase();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

