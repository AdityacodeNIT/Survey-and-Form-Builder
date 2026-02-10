# Middleware

This directory contains Express middleware functions used throughout the application.

## Error Handler Middleware

The error handler middleware provides centralized error handling for the entire application.

### Features

- **Standardized Error Responses**: All errors return a consistent JSON structure
- **HTTP Status Code Mapping**: Automatically maps error types to appropriate HTTP status codes
- **Detailed Logging**: Logs errors with context (method, path, user, etc.) for debugging
- **Field-Specific Validation Errors**: Extracts and returns field-level errors from Mongoose validation
- **Development Mode Stack Traces**: Includes stack traces in development for easier debugging

### Supported Error Types

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| `ApiError` | Custom | Base error class with custom status codes |
| `ValidationError` | 400 | Request validation failures |
| `NotFoundError` | 404 | Resource not found |
| `UnauthorizedError` | 401 | Authentication required |
| `ForbiddenError` | 403 | Access forbidden |
| Mongoose `ValidationError` | 400 | Database validation failures |
| Mongoose `CastError` | 400 | Invalid ObjectId format |
| MongoDB Duplicate Key (11000) | 409 | Duplicate entry |
| JWT `JsonWebTokenError` | 401 | Invalid JWT token |
| JWT `TokenExpiredError` | 401 | Expired JWT token |
| Generic `Error` | 500 | Internal server error |

### Usage

The error handler is automatically applied to all routes in `app.ts`:

```typescript
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// ... other middleware and routes ...

// 404 handler for unknown routes (must be after all other routes)
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);
```

### Error Response Format

All errors return a JSON response with the following structure:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "stack": "Error stack trace (development only)"
}
```

### Throwing Errors in Route Handlers

Use the `asyncHandler` wrapper and throw `ApiError` instances:

```typescript
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/apiError.js';

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json(user);
}));
```

### Logging

Errors are logged with different severity levels:

- **5xx errors**: Logged as `error` (red)
- **4xx errors**: Logged as `warn` (yellow)

Each log entry includes:
- Status code
- Error message
- Stack trace
- HTTP method
- Request path
- Client IP address
- User ID (if authenticated)

### Testing

Run the manual test suite:

```bash
npx tsx src/middleware/errorHandler.manual-test.ts
```

This will verify that all error types are handled correctly.
