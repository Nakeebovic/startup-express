# 📖 Startup Express API Reference

Complete API documentation for all exports and functions.

## Table of Contents

- [Validation](#validation)
- [Error Handling](#error-handling)
- [Response Helpers](#response-helpers)
- [Middleware](#middleware)
- [Configuration](#configuration)
- [Logging](#logging)
- [Types](#types)

---

## Validation

### `validate(schema, source?, options?)`

Validate request data using Zod schema.

**Parameters:**
- `schema: ZodSchema` - Zod validation schema
- `source?: 'body' | 'query' | 'params' | 'headers'` - Source to validate (default: `'body'`)
- `options?: ValidateOptions` - Validation options

**ValidateOptions:**
```typescript
{
  stripUnknown?: boolean;  // Strip unknown keys (default: false)
  abortEarly?: boolean;    // Abort on first error (default: false)
}
```

**Returns:** Express middleware function

**Example:**
```typescript
import { z, validate } from 'startup-express';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

app.post('/users', validate(schema, 'body'), handler);
```

---

### `validateAll(schemas)`

Validate multiple request sources at once.

**Parameters:**
- `schemas: Partial<Record<ValidationSource, ZodSchema>>` - Object with schemas for each source

**Example:**
```typescript
validateAll({
  params: z.object({ id: z.string() }),
  body: z.object({ name: z.string() }),
  query: z.object({ notify: z.boolean().optional() }),
})
```

---

### `createValidatedHandler(schemas, handler)`

Create a type-safe validated request handler.

**Parameters:**
- `schemas: { body?, query?, params? }` - Validation schemas
- `handler: Function` - Route handler function

**Returns:** `[validator, handler]` middleware array

---

### `commonSchemas`

Pre-built validation schemas for common use cases.

```typescript
commonSchemas.email         // Email (lowercase)
commonSchemas.password      // Strong password
commonSchemas.objectId      // MongoDB ObjectId
commonSchemas.uuid          // UUID v4
commonSchemas.url           // Valid URL
commonSchemas.dateString    // ISO 8601 date
commonSchemas.pagination    // { page, limit }
commonSchemas.search        // { q, sort, order }
```

**Example:**
```typescript
const schema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
});
```

---

### `createPaginationSchema(maxLimit)`

Create custom pagination schema with max limit.

**Parameters:**
- `maxLimit: number` - Maximum items per page

**Returns:** Zod schema

**Example:**
```typescript
const schema = createPaginationSchema(50); // Max 50 items
```

---

### `createEnumSchema(values, fieldName?)`

Create enum schema with custom error message.

**Parameters:**
- `values: string[]` - Allowed values
- `fieldName?: string` - Field name for error message

**Returns:** Zod enum schema

**Example:**
```typescript
const roleSchema = createEnumSchema(
  ['user', 'admin', 'moderator'],
  'role'
);
```

---

### `z`

Re-exported Zod library for convenience.

```typescript
import { z } from 'startup-express';

const schema = z.object({
  name: z.string(),
  age: z.number(),
});
```

---

## Error Handling

### `AppError`

Custom error class for operational errors.

**Constructor:**
```typescript
new AppError(
  message: string,
  statusCode?: number,
  errorCode?: ErrorCode,
  details?: any
)
```

**Static Methods:**
```typescript
AppError.badRequest(message, details?)     // 400
AppError.unauthorized(message, details?)   // 401
AppError.forbidden(message, details?)      // 403
AppError.notFound(message, details?)       // 404
AppError.conflict(message, details?)       // 409
AppError.validation(message, details?)     // 422
AppError.internal(message, details?)       // 500
```

**Example:**
```typescript
throw AppError.notFound('User not found', { userId: '123' });
```

---

### `catchAsync(fn)`

Async error handler wrapper for route handlers.

**Parameters:**
- `fn: AsyncFunction` - Async route handler

**Returns:** Express middleware

**Example:**
```typescript
app.get('/users', catchAsync(async (req, res) => {
  const users = await getUsers();
  res.json(users);
}));
```

**Alias:** `asyncHandler` (same function)

---

### `ErrorCode`

Enum of structured error codes.

```typescript
enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
```

---

## Response Helpers

### `sendSuccess(res, data, message?, statusCode?, req?)`

Send a success response with metadata.

**Parameters:**
- `res: Response` - Express response object
- `data: any` - Response data
- `message?: string` - Success message
- `statusCode?: number` - HTTP status code (default: 200)
- `req?: Request` - Express request (for requestId)

**Example:**
```typescript
sendSuccess(res, users, 'Users fetched', 200, req);
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Users fetched",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "abc123"
  }
}
```

---

### `sendCreated(res, data, message?, req?)`

Send a 201 Created response.

**Example:**
```typescript
sendCreated(res, newUser, 'User created', req);
```

---

### `sendPaginated(res, data, pagination, req?)`

Send a paginated response with metadata.

**Parameters:**
- `pagination: { page, limit, total }` - Pagination info

**Example:**
```typescript
sendPaginated(res, users, {
  page: 1,
  limit: 10,
  total: 100
}, req);
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "timestamp": "...",
    "requestId": "...",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### `sendAccepted(res, data, message?, req?)`

Send a 202 Accepted response (for async operations).

---

### `sendNoContent(res)`

Send a 204 No Content response.

---

### `getPaginationOffset(page, limit)`

Calculate pagination offset for database queries.

**Returns:** `number`

**Example:**
```typescript
const offset = getPaginationOffset(2, 10); // Returns 10
```

---

### `createPaginationMeta(page, limit, total)`

Create pagination metadata object.

**Returns:** `PaginationMeta`

---

## Middleware

### `setupExpress(app, config?)`

Setup Express app with all middleware and configurations.

**Parameters:**
- `app: Express` - Express application instance
- `config?: StartupExpressConfig` - Configuration options

**Returns:** Configured Express app

**Example:**
```typescript
setupExpress(app, {
  cors: {
    origin: 'https://example.com',
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  requestId: {
    enabled: true,
    header: 'X-Request-Id',
  },
});
```

---

### `addErrorHandlers(app)`

Add 404 and global error handlers. **Must be called after all routes.**

**Parameters:**
- `app: Express` - Express application

**Example:**
```typescript
// Define all routes first
app.get('/users', handler);

// Then add error handlers
addErrorHandlers(app);
```

---

### Individual Middleware

#### `helmetMiddleware(options?)`

Security headers middleware using Helmet.

**Example:**
```typescript
app.use(helmetMiddleware({
  contentSecurityPolicy: { ... }
}));
```

---

#### `corsMiddleware(options?)`

CORS middleware.

**Example:**
```typescript
app.use(corsMiddleware({
  origin: 'https://example.com',
  credentials: true,
}));
```

---

#### `compressionMiddleware(options?)`

Response compression middleware.

---

#### `rateLimitMiddleware(options?)`

Rate limiting middleware.

**Options:**
```typescript
{
  windowMs?: number;  // Time window in milliseconds
  max?: number;       // Max requests per window
}
```

**Example:**
```typescript
app.use(rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));
```

---

#### `strictRateLimitMiddleware(options?)`

Strict rate limiting for sensitive endpoints (e.g., login).

**Example:**
```typescript
app.post('/auth/login', strictRateLimitMiddleware(), handler);
```

---

#### `requestIdMiddleware(options?)`

Request ID tracking middleware.

**Options:**
```typescript
{
  header?: string;           // Header name (default: 'X-Request-Id')
  generator?: () => string;  // Custom ID generator
}
```

**Example:**
```typescript
app.use(requestIdMiddleware({
  header: 'X-Request-Id',
}));
```

---

#### `timingMiddleware(options?)`

Request timing middleware with slow request detection.

**Options:**
```typescript
{
  slowRequestThreshold?: number; // Milliseconds (default: 1000)
}
```

---

#### `sanitizeMiddleware()`

Input sanitization middleware (NoSQL injection protection).

---

#### `morganMiddleware(format?)`

HTTP request logging middleware.

**Formats:** `'dev'`, `'combined'`, `'common'`, `'short'`, `'tiny'`

---

#### `jsonMiddleware(options?)`

JSON body parser middleware.

---

#### `urlencodedMiddleware(options?)`

URL-encoded body parser middleware.

---

## Configuration

### `config`

Environment configuration object.

**Properties:**
```typescript
config.env              // 'development' | 'production' | 'test'
config.port             // Server port (from PORT env var)
config.isProduction     // boolean
config.isDevelopment    // boolean
config.isTest           // boolean
```

---

### `getEnv(key, defaultValue?)`

Get string environment variable.

**Throws:** Error if not found and no default provided

**Example:**
```typescript
const apiKey = getEnv('API_KEY');
const optional = getEnv('OPTIONAL_VAR', 'default');
```

---

### `getEnvNumber(key, defaultValue?)`

Get number environment variable.

**Example:**
```typescript
const port = getEnvNumber('PORT', 3000);
```

---

### `getEnvBoolean(key, defaultValue?)`

Get boolean environment variable.

**Example:**
```typescript
const debug = getEnvBoolean('DEBUG', false);
```

---

## Logging

### `logger`

Winston logger instance with context-aware logging.

**Methods:**
```typescript
logger.debug(message, meta?)
logger.info(message, meta?)
logger.warn(message, meta?)
logger.error(message, meta?)
```

**Example:**
```typescript
logger.info('User created', {
  userId: user.id,
  email: user.email,
  requestId: req.requestId,
});

logger.error('Database error', {
  error: err.message,
  stack: err.stack,
  requestId: req.requestId,
});
```

**Features:**
- Console logging in development (colorized)
- File logging in production (with rotation)
- Automatic log levels
- Context metadata support

---

## Types

### `StartupExpressConfig`

Configuration interface for `setupExpress()`.

```typescript
interface StartupExpressConfig {
  cors?: {
    enabled?: boolean;
    origin?: string | string[];
    credentials?: boolean;
  };
  helmet?: {
    enabled?: boolean;
  };
  compression?: {
    enabled?: boolean;
  };
  rateLimit?: {
    enabled?: boolean;
    windowMs?: number;
    max?: number;
  };
  logging?: {
    enabled?: boolean;
    format?: 'dev' | 'combined' | 'common' | 'short' | 'tiny';
  };
  requestId?: {
    enabled?: boolean;
    header?: string;
  };
}
```

---

### `ErrorResponse`

Error response interface.

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  requestId?: string;
  timestamp?: string;
  errors?: any[];
  stack?: string; // Only in development
}
```

---

### `SuccessResponse<T>`

Success response interface.

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp?: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}
```

---

### `PaginationMeta`

Pagination metadata interface.

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

---

### Extended Express Types

```typescript
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}
```

---

## Complete Import Example

```typescript
import express from 'express';
import {
  // Setup
  setupExpress,
  addErrorHandlers,
  
  // Validation
  z,
  validate,
  validateAll,
  commonSchemas,
  createPaginationSchema,
  createEnumSchema,
  
  // Error Handling
  AppError,
  ErrorCode,
  catchAsync,
  
  // Response Helpers
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendAccepted,
  sendNoContent,
  getPaginationOffset,
  createPaginationMeta,
  
  // Middleware
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware,
  rateLimitMiddleware,
  strictRateLimitMiddleware,
  morganMiddleware,
  requestIdMiddleware,
  timingMiddleware,
  sanitizeMiddleware,
  
  // Configuration
  config,
  getEnv,
  getEnvNumber,
  getEnvBoolean,
  
  // Logging
  logger,
  
  // Types
  StartupExpressConfig,
  ErrorResponse,
  SuccessResponse,
  PaginationMeta,
} from 'startup-express';
```

---

## Quick Reference

### Most Common Imports

```typescript
import {
  setupExpress,
  addErrorHandlers,
  z,
  validate,
  catchAsync,
  sendSuccess,
  AppError,
  logger,
} from 'startup-express';
```

### Typical Route Pattern

```typescript
const schema = z.object({
  email: commonSchemas.email,
  name: z.string().min(2),
});

app.post('/users',
  validate(schema, 'body'),
  catchAsync(async (req, res) => {
    const user = await createUser(req.body);
    sendSuccess(res, user, 'User created', 201, req);
  })
);
```

---

For more examples, see:
- [README.md](README.md) - Main documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [EXAMPLE.md](EXAMPLE.md) - Complete examples

