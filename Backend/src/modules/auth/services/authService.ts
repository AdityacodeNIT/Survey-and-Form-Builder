import argon2 from 'argon2';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { config } from '../../../config/env.js';
import { ApiError } from '../../../utils/apiError.js';
import { logger } from '../../../utils/logger.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

// Register

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { email, password, name } = input;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Validate password strength (minimum 6 characters for MVP)
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  // Hash password using Argon2
  const passwordHash = await argon2.hash(password);

  // Create user
  const user = await User.create({
    email,
    passwordHash,
    name,
  });

  logger.info(`New user registered: ${user.email}`);

  // Generate JWT token

  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    token,
  };
};

// Login 

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await argon2.verify(user.passwordHash, password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  logger.info(`User logged in: ${user.email}`);

  // Generate JWT token
  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    token,
  };
};


// jwt 

export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as SignOptions);

  return token;
};


 // Verify JWT token

export const verifyToken = (token: string): { userId: string; email: string } => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      email: string;
    };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid token');
    }
    throw new ApiError(401, 'Token verification failed');
  }
};
