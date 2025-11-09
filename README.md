# 🚀 Startup Express

A comprehensive, production-ready Express.js starter package with **Zod validation**, advanced middleware, and TypeScript-first design.

[![npm version](https://img.shields.io/npm/v/startup-express.svg)](https://www.npmjs.com/package/startup-express)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- **🔐 Zod Validation**: TypeScript-first schema validation with automatic type inference
- **🆔 Request Tracking**: Unique ID for every request with automatic logging correlation
- **⏱️ Performance Monitoring**: Request timing with slow request detection
- **🧹 Input Sanitization**: Automatic NoSQL injection protection
- **🛡️ Error Handling**: Structured error codes with detailed error responses
- **📊 Response Helpers**: Consistent API responses with pagination support
- **🔒 Security**: Helmet, CORS, rate limiting out of the box
- **📝 Logging**: Winston + Morgan with context-aware logging
- **⚡ Performance**: Compression and optimized middleware stack
- **🏥 Health Checks**: Built-in `/health` and `/ready` endpoints

## 📦 Installation

```bash
npm install startup-express express zod
```

## 🚀 Quick Start

```typescript
import express from 'express';
import { setupExpress, addErrorHandlers, z, validate, catchAsync, sendSuccess } from 'startup-express';

const app = express();

// One line setup with all middleware
setupExpress(app);

// Define validation schema
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().int().min(18),
});

// Create validated route
app.post('/users',
  validate(userSchema, 'body'),
  catchAsync(async (req, res) => {
    // req.body is fully typed and validated!
    const { email, name, age } = req.body;
    const user = { id: 1, email, name, age };
    sendSuccess(res, user, 'User created', 201, req);
  })
);

// Add error handlers (must be last)
addErrorHandlers(app);

app.listen(3000, () => console.log('Server running on port 3000'));
```

## 🎯 Core Features

### Zod Validation with Type Inference

```typescript
import { z, validate, commonSchemas } from 'startup-express';

// Use pre-built common schemas
const createUserSchema = z.object({
  email: commonSchemas.email,      // Email validation + lowercase
  password: commonSchemas.password, // Strong password requirements
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).optional(),
});

app.post('/users',
  validate(createUserSchema, 'body'),
  async (req, res) => {
    // TypeScript knows the exact type of req.body!
  }
);
```

**Available Common Schemas:**
- `commonSchemas.email` - Email with lowercase normalization
- `commonSchemas.password` - Strong password (8+ chars, complexity requirements)
- `commonSchemas.objectId` - MongoDB ObjectId
- `commonSchemas.uuid` - UUID v4
- `commonSchemas.url` - Valid URL
- `commonSchemas.dateString` - ISO 8601 date
- `commonSchemas.pagination` - Page and limit with defaults
- `commonSchemas.search` - Search query with sort/order

### Advanced Error Handling

```typescript
import { AppError, ErrorCode, catchAsync } from 'startup-express';

app.get('/users/:id',
  catchAsync(async (req, res) => {
    const user = await findUser(req.params.id);
    
    if (!user) {
      // Throw structured error
      throw AppError.notFound('User not found', { userId: req.params.id });
    }
    
    res.json({ success: true, data: user });
  })
);
```

**Error Response Format:**
```json
{
  "success": false,
  "message": "User not found",
  "errorCode": "NOT_FOUND",
  "requestId": "V1StGXR8_Z5jdHi6B-myT",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errors": [{ "userId": "123" }]
}
```

**Available Error Methods:**
- `AppError.badRequest(message, details?)` - 400
- `AppError.unauthorized(message, details?)` - 401
- `AppError.forbidden(message, details?)` - 403
- `AppError.notFound(message, details?)` - 404
- `AppError.conflict(message, details?)` - 409
- `AppError.validation(message, details?)` - 422
- `AppError.internal(message, details?)` - 500

### Response Helpers

```typescript
import { sendSuccess, sendPaginated, sendCreated } from 'startup-express';

// Success response
sendSuccess(res, data, 'Operation successful', 200, req);

// Created response (201)
sendCreated(res, newUser, 'User created', req);

// Paginated response
sendPaginated(res, users, { page: 1, limit: 10, total: 100 }, req);
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "V1StGXR8_Z5jdHi6B-myT",
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

### Request Tracking

Every request automatically gets a unique ID:

```typescript
app.get('/api/users', (req, res) => {
  // Access request ID
  console.log(req.requestId); // "V1StGXR8_Z5jdHi6B-myT"
  
  // Automatically included in logs
  logger.info('Fetching users', { requestId: req.requestId });
  
  // Included in response headers: X-Request-Id
  // Included in all error and success responses
});
```

### Multiple Source Validation

```typescript
import { validateAll, z } from 'startup-express';

app.put('/users/:id',
  validateAll({
    params: z.object({ id: z.string() }),
    body: z.object({ name: z.string() }),
    query: z.object({ notify: z.boolean().optional() }),
  }),
  handler
);
```

## ⚙️ Configuration

```typescript
setupExpress(app, {
  cors: {
    origin: ['https://example.com'],
    credentials: true,
  },
  helmet: {
    enabled: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  logging: {
    format: 'combined', // 'dev' | 'combined' | 'common'
  },
  requestId: {
    enabled: true,
    header: 'X-Request-Id',
  },
});
```

## 🔧 Individual Middleware Usage

```typescript
import {
  helmetMiddleware,
  corsMiddleware,
  rateLimitMiddleware,
  strictRateLimitMiddleware,
  requestIdMiddleware,
  timingMiddleware,
  sanitizeMiddleware,
} from 'startup-express';

// Use middleware individually
app.use(helmetMiddleware());
app.use(corsMiddleware({ origin: 'https://example.com' }));
app.use(requestIdMiddleware());
app.use(timingMiddleware({ slowRequestThreshold: 2000 }));

// Apply strict rate limiting to auth routes
app.post('/auth/login', strictRateLimitMiddleware(), loginHandler);
```

## 📝 Logging

```typescript
import { logger } from 'startup-express';

// Log with context
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

## 🏥 Health Checks

Built-in health check endpoints:

```bash
# Detailed health check
GET /health
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "requestId": "abc123"
}

# Readiness check (for Kubernetes/Docker)
GET /ready
{
  "success": true,
  "message": "Server is ready"
}
```

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- **[API Reference](API_REFERENCE.md)** - Complete API documentation
- **[Examples](EXAMPLE.md)** - Full REST API examples
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[Changelog](CHANGELOG.md)** - Version history

## 🎯 What's Included

### Middleware
- ✅ Helmet (security headers)
- ✅ CORS (cross-origin resource sharing)
- ✅ Compression (gzip responses)
- ✅ Rate limiting (standard and strict)
- ✅ Body parser (JSON and URL-encoded)
- ✅ Request ID tracking
- ✅ Request timing
- ✅ Input sanitization
- ✅ HTTP request logging

### Validation
- ✅ Zod schema validation
- ✅ Multi-source validation
- ✅ Common validation schemas
- ✅ Type-safe request handlers
- ✅ Automatic error formatting

### Error Handling
- ✅ Structured error codes
- ✅ Custom AppError class
- ✅ Static error methods
- ✅ Async error handling
- ✅ Global error handlers
- ✅ 404 handler

### Response Helpers
- ✅ Success responses
- ✅ Paginated responses
- ✅ Created responses (201)
- ✅ Accepted responses (202)
- ✅ No content responses (204)

### Utilities
- ✅ Environment config helpers
- ✅ Winston logger with file rotation
- ✅ TypeScript type definitions
- ✅ Request/response interfaces

## 🚀 Use Cases

Perfect for:
- **REST APIs**: Build type-safe REST APIs quickly
- **Microservices**: Consistent setup across services
- **Prototyping**: Get from zero to production fast
- **Learning**: Best practices for Express.js
- **Boilerplates**: Foundation for your templates

## 🌟 Why Startup Express?

- **⚡ Fast Setup**: One function call to configure everything
- **🔒 Secure**: Security best practices included
- **📦 Type-Safe**: Full TypeScript with Zod validation
- **🎨 Flexible**: Use complete package or individual pieces
- **📝 Well Documented**: Extensive guides and examples
- **🧪 Production Ready**: Battle-tested patterns
- **🔄 Modern**: Latest tools and best practices

## 💡 Examples

### Basic CRUD API
See [EXAMPLE.md](EXAMPLE.md) for complete REST API example with:
- User CRUD operations
- Pagination and filtering
- Error handling
- Request validation
- Type-safe handlers

### Simple API
```typescript
import express from 'express';
import { setupExpress, addErrorHandlers, z, validate, sendSuccess } from 'startup-express';

const app = express();
setupExpress(app);

const schema = z.object({ name: z.string() });

app.post('/items',
  validate(schema, 'body'),
  (req, res) => sendSuccess(res, req.body, 'Item created')
);

addErrorHandlers(app);
app.listen(3000);
```

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © [Nakeebovic]

## 🙏 Acknowledgments

Built with these amazing packages:
- [Express](https://expressjs.com/)
- [Zod](https://zod.dev/)
- [Winston](https://github.com/winstonjs/winston)
- [Helmet](https://helmetjs.github.io/)
- [Morgan](https://github.com/expressjs/morgan)

---

## 👨‍💻 Author

**Ahmed El Nakeeb (Nakeebovic)**
- GitHub: [@Nakeebovic](https://github.com/Nakeebovic)
- npm: [nakeebovic](https://www.npmjs.com/~nakeebovic)

---

**Made with ❤️ for the Express.js community**

**⭐ Star this repo if you find it helpful!**

