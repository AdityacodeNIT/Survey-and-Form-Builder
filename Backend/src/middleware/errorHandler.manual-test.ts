/**
 * Manual test for error handling middleware
 * Run with: npx tsx src/middleware/errorHandler.manual-test.ts
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from './errorHandler.js';
import { ApiError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/apiError.js';

// Mock response object
const createMockResponse = () => {
  const res: any = {
    statusCode: 0,
    body: null,
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      this.body = data;
      return this;
    }
  };
  return res;
};

// Mock request object
const createMockRequest = (path: string = '/test'): Partial<Request> => ({
  method: 'GET',
  path,
  ip: '127.0.0.1',
  originalUrl: path,
});

// Test helper
const runTest = (name: string, error: Error, expectedStatus: number, expectedMessage: string) => {
  const req = createMockRequest();
  const res = createMockResponse();
  const next = () => {};
  
  errorHandler(error, req as Request, res as Response, next);
  
  const passed = res.statusCode === expectedStatus && res.body.message === expectedMessage;
  console.log(`${passed ? '✓' : '✗'} ${name}`);
  if (!passed) {
    console.log(`  Expected: ${expectedStatus} - ${expectedMessage}`);
    console.log(`  Got: ${res.statusCode} - ${res.body.message}`);
  }
  return passed;
};

console.log('\n🧪 Testing Error Handler Middleware\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: ApiError
totalTests++;
if (runTest(
  'ApiError with custom status and message',
  new ApiError(400, 'Bad request'),
  400,
  'Bad request'
)) passedTests++;

// Test 2: ValidationError
totalTests++;
if (runTest(
  'ValidationError returns 400',
  new ValidationError('Invalid input'),
  400,
  'Invalid input'
)) passedTests++;

// Test 3: NotFoundError
totalTests++;
if (runTest(
  'NotFoundError returns 404',
  new NotFoundError('Resource not found'),
  404,
  'Resource not found'
)) passedTests++;

// Test 4: UnauthorizedError
totalTests++;
if (runTest(
  'UnauthorizedError returns 401',
  new UnauthorizedError('Authentication required'),
  401,
  'Authentication required'
)) passedTests++;

// Test 5: ForbiddenError
totalTests++;
if (runTest(
  'ForbiddenError returns 403',
  new ForbiddenError('Access forbidden'),
  403,
  'Access forbidden'
)) passedTests++;

// Test 6: Generic Error
totalTests++;
if (runTest(
  'Generic Error returns 500',
  new Error('Something went wrong'),
  500,
  'Internal server error'
)) passedTests++;

// Test 7: Mongoose ValidationError
totalTests++;
const mongooseError: any = {
  name: 'ValidationError',
  message: 'Validation failed',
  errors: {
    email: { path: 'email', message: 'Email is required' },
  },
};
const req7 = createMockRequest();
const res7 = createMockResponse();
errorHandler(mongooseError, req7 as Request, res7 as Response, () => {});
const test7Passed = res7.statusCode === 400 && res7.body.message === 'Validation failed' && res7.body.errors?.length > 0;
console.log(`${test7Passed ? '✓' : '✗'} Mongoose ValidationError returns 400 with field errors`);
if (test7Passed) passedTests++;

// Test 8: Mongoose CastError
totalTests++;
const castError: any = {
  name: 'CastError',
  message: 'Cast to ObjectId failed',
};
if (runTest(
  'Mongoose CastError returns 400',
  castError,
  400,
  'Invalid ID format'
)) passedTests++;

// Test 9: MongoDB Duplicate Key Error
totalTests++;
const duplicateError: any = {
  name: 'MongoError',
  code: 11000,
  keyPattern: { email: 1 },
};
const req9 = createMockRequest();
const res9 = createMockResponse();
errorHandler(duplicateError, req9 as Request, res9 as Response, () => {});
const test9Passed = res9.statusCode === 409 && res9.body.message === 'email already exists';
console.log(`${test9Passed ? '✓' : '✗'} MongoDB duplicate key error returns 409`);
if (test9Passed) passedTests++;

// Test 10: JWT JsonWebTokenError
totalTests++;
const jwtError: any = {
  name: 'JsonWebTokenError',
  message: 'jwt malformed',
};
if (runTest(
  'JWT JsonWebTokenError returns 401',
  jwtError,
  401,
  'Invalid token'
)) passedTests++;

// Test 11: JWT TokenExpiredError
totalTests++;
const expiredError: any = {
  name: 'TokenExpiredError',
  message: 'jwt expired',
};
if (runTest(
  'JWT TokenExpiredError returns 401',
  expiredError,
  401,
  'Token expired'
)) passedTests++;

// Test 12: notFoundHandler
totalTests++;
const req12 = createMockRequest('/unknown-route');
const res12 = createMockResponse();
let capturedError: any = null;
const next12 = (err: any) => { capturedError = err; };
notFoundHandler(req12 as Request, res12 as Response, next12);
const test12Passed = capturedError instanceof ApiError && 
                     capturedError.statusCode === 404 && 
                     capturedError.message.includes('/unknown-route');
console.log(`${test12Passed ? '✓' : '✗'} notFoundHandler creates 404 error`);
if (test12Passed) passedTests++;

console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed\n`);

if (passedTests === totalTests) {
  console.log('✅ All tests passed!\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed\n');
  process.exit(1);
}
