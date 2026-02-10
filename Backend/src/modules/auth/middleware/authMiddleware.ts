import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';
import { ApiError } from '../../../utils/apiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

// Extend Express Request type to include user

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}


 // Middleware to authenticate requests using JWT token

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {

    // Get token from Authorization header

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided. Please authenticate.');
    }


    const token = authHeader.substring(7);

    // Verify token and get user info
    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  }
);
