import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware
 * Catches all errors and returns standardized error responses
 * 
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] | undefined;

  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    // Extract field-specific errors from Mongoose
    errors = Object.values((err as any).errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  // Handle MongoDB duplicate key errors
  else if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys((err as any).keyPattern || {})[0];
    if (field) {
      message = `${field} already exists`;
    }
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error with context for debugging
  const errorContext = {
    statusCode,
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: (req as any).user?.id || 'unauthenticated',
  };

  // Log errors based on severity
  if (statusCode >= 500) {
    logger.error(`Server Error: ${JSON.stringify(errorContext)}`);
  } else if (statusCode >= 400) {
    logger.warn(`Client Error: ${JSON.stringify(errorContext)}`);
  }

  // Return standardized error response
  const response: any = {
    success: false,
    message,
    statusCode,
  };

  // Include field-specific errors if available
  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler for unknown routes
 * Should be added after all other routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};
