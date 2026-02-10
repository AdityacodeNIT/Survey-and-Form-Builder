import { Request, Response, NextFunction } from 'express';


  // Type definition for async route handlers



type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;



/**
 * Wrapper for async route handlers to catch errors automatically
 * and pass them to Express error handling middleware
 * 
 * @param fn - Async route handler function
 * @returns Wrapped function that catches errors
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// flexible funtion structure