import { Request, Response } from 'express';
import { register, login } from '../services/authService.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/apiError.js';

// Register a new user
 
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name} = req.body;

  // Validate input

  if (!email || !password || !name) {
    throw new ApiError(400, 'Email, password, and name are required');
  }

  // Register user

  const result = await register({ email, password, name });

  // Send response

  return ApiResponse.created(res, result, 'User registered successfully');
});

//  Login user

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Login user

  const result = await login({ email, password });

  // Send response
  
  return ApiResponse.success(res, result, 'Login successful');
});
