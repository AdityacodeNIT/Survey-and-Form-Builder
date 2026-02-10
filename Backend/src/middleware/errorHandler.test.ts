import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from './errorHandler.js';
import { ApiError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/apiError.js';

// Mock logger to prevent console output during tests
jest.mock('../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1',
      originalUrl: '/test',
    };
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    
    mockNext = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle ApiError with correct status code and message', () => {
      const error = new ApiError(400, 'Bad request');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bad request',
          statusCode: 400,
        })
      );
    });

    it('should handle ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid input',
          statusCode: 400,
        })
      );
    });

    it('should handle NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Resource not found',
          statusCode: 404,
        })
      );
    });

    it('should handle UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError('Authentication required');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Authentication required',
          statusCode: 401,
        })
      );
    });

    it('should handle ForbiddenError with 403 status', () => {
      const error = new ForbiddenError('Access forbidden');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Access forbidden',
          statusCode: 403,
        })
      );
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Internal server error',
          statusCode: 500,
        })
      );
    });

    it('should handle Mongoose ValidationError', () => {
      const error: any = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: {
          email: { path: 'email', message: 'Email is required' },
          name: { path: 'name', message: 'Name is required' },
        },
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          statusCode: 400,
          errors: expect.arrayContaining([
            { field: 'email', message: 'Email is required' },
            { field: 'name', message: 'Name is required' },
          ]),
        })
      );
    });

    it('should handle Mongoose CastError', () => {
      const error: any = {
        name: 'CastError',
        message: 'Cast to ObjectId failed',
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid ID format',
          statusCode: 400,
        })
      );
    });

    it('should handle MongoDB duplicate key error', () => {
      const error: any = {
        code: 11000,
        keyPattern: { email: 1 },
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'email already exists',
          statusCode: 409,
        })
      );
    });

    it('should handle JWT JsonWebTokenError', () => {
      const error: any = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed',
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid token',
          statusCode: 401,
        })
      );
    });

    it('should handle JWT TokenExpiredError', () => {
      const error: any = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Token expired',
          statusCode: 401,
        })
      );
    });
  });

  describe('notFoundHandler', () => {
    it('should create 404 error and pass to next middleware', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Route /test not found',
        })
      );
    });
  });
});
