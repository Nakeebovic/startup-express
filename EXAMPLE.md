# Complete Examples

This document contains complete, working examples of using Startup Express to build REST APIs.

## Table of Contents

- [Basic Example](#basic-example)
- [Complete REST API](#complete-rest-api)
- [TypeScript with Full Type Safety](#typescript-with-full-type-safety)
- [Advanced Features](#advanced-features)

---

## Basic Example

Simple Express API with validation:

```typescript
import express from 'express';
import {
  setupExpress,
  addErrorHandlers,
  z,
  validate,
  sendSuccess,
  logger,
} from 'startup-express';

const app = express();
setupExpress(app);

// Simple schema
const itemSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
});

// POST endpoint with validation
app.post('/items',
  validate(itemSchema, 'body'),
  (req, res) => {
    const item = { id: 1, ...req.body };
    sendSuccess(res, item, 'Item created', 201, req);
  }
);

addErrorHandlers(app);

app.listen(3000, () => {
  logger.info('Server running on port 3000');
});
```

---

## Complete REST API

Full CRUD API with pagination, filtering, and error handling:

```typescript
import express, { Request, Response } from 'express';
import {
  setupExpress,
  addErrorHandlers,
  z,
  validate,
  validateAll,
  commonSchemas,
  catchAsync,
  AppError,
  sendSuccess,
  sendCreated,
  sendPaginated,
  logger,
} from 'startup-express';

const app = express();

// Setup with configuration
setupExpress(app, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  logging: {
    format: 'dev',
  },
});

// ===============================================
// Schemas
// ===============================================

const createUserSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  name: z.string().min(2).max(50).trim(),
  age: z.number().int().min(18).max(120).optional(),
});

const updateUserSchema = createUserSchema.partial();

const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid user ID').transform(Number),
});

// ===============================================
// Mock Database
// ===============================================

interface User {
  id: number;
  email: string;
  name: string;
  age?: number;
  createdAt: Date;
}

let users: User[] = [
  {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    age: 30,
    createdAt: new Date(),
  },
  {
    id: 2,
    email: 'jane@example.com',
    name: 'Jane Smith',
    age: 28,
    createdAt: new Date(),
  },
];

let nextId = 3;

// ===============================================
// Routes
// ===============================================

// Get all users with pagination
app.get('/api/users',
  validate(getUsersQuerySchema, 'query'),
  catchAsync(async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as any;
    
    let filteredUsers = users;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(
        u => u.name.toLowerCase().includes(searchLower) ||
             u.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Paginate
    const total = filteredUsers.length;
    const start = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(start, start + limit);
    
    sendPaginated(res, paginatedUsers, { page, limit, total }, req);
  })
);

// Get user by ID
app.get('/api/users/:id',
  validate(userIdSchema, 'params'),
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as any;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      throw AppError.notFound('User not found', { userId: id });
    }
    
    sendSuccess(res, user, undefined, 200, req);
  })
);

// Create user
app.post('/api/users',
  validate(createUserSchema, 'body'),
  catchAsync(async (req: Request, res: Response) => {
    const { email, name, age } = req.body;
    
    // Check if email exists
    if (users.some(u => u.email === email)) {
      throw AppError.conflict('Email already exists', { email });
    }
    
    const newUser: User = {
      id: nextId++,
      email,
      name,
      age,
      createdAt: new Date(),
    };
    
    users.push(newUser);
    
    logger.info('User created', {
      userId: newUser.id,
      email: newUser.email,
      requestId: req.requestId,
    });
    
    sendCreated(res, newUser, 'User created successfully', req);
  })
);

// Update user
app.put('/api/users/:id',
  validateAll({
    params: userIdSchema,
    body: updateUserSchema,
  }),
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as any;
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw AppError.notFound('User not found', { userId: id });
    }
    
    // Check email uniqueness if updating email
    if (req.body.email && users.some(u => u.email === req.body.email && u.id !== id)) {
      throw AppError.conflict('Email already exists', { email: req.body.email });
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...req.body,
    };
    
    logger.info('User updated', {
      userId: id,
      requestId: req.requestId,
    });
    
    sendSuccess(res, users[userIndex], 'User updated successfully', 200, req);
  })
);

// Delete user
app.delete('/api/users/:id',
  validate(userIdSchema, 'params'),
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as any;
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw AppError.notFound('User not found', { userId: id });
    }
    
    const deletedUser = users[userIndex];
    users = users.filter(u => u.id !== id);
    
    logger.info('User deleted', {
      userId: id,
      email: deletedUser.email,
      requestId: req.requestId,
    });
    
    sendSuccess(res, null, 'User deleted successfully', 200, req);
  })
);

// Add error handlers
addErrorHandlers(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📝 Health check: http://localhost:${PORT}/health`);
  logger.info(`👥 Users API: http://localhost:${PORT}/api/users`);
});
```

---

## Testing the API

```bash
# Get all users
curl http://localhost:3000/api/users

# Get users with pagination
curl "http://localhost:3000/api/users?page=1&limit=5"

# Search users
curl "http://localhost:3000/api/users?search=john"

# Get single user
curl http://localhost:3000/api/users/1

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "SecurePass123!",
    "name": "Bob Wilson",
    "age": 35
  }'

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "age": 31
  }'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1

# Test validation (should fail)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "weak",
    "name": "A"
  }'

# Health check
curl http://localhost:3000/health
```

---

## TypeScript with Full Type Safety

Using Zod for complete type inference:

```typescript
import express, { Request, Response } from 'express';
import {
  setupExpress,
  addErrorHandlers,
  z,
  validate,
  catchAsync,
  sendSuccess,
} from 'startup-express';

const app = express();
setupExpress(app);

// Define schema
const bookSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  isbn: z.string().regex(/^[0-9-]{10,17}$/, 'Invalid ISBN'),
  year: z.number().int().min(1000).max(new Date().getFullYear()),
  price: z.number().positive(),
  tags: z.array(z.string()).optional(),
});

// Infer TypeScript type from schema
type Book = z.infer<typeof bookSchema>;

// Mock database
const books: (Book & { id: number })[] = [];
let nextId = 1;

// Type-safe route handler
app.post('/books',
  validate(bookSchema, 'body'),
  catchAsync(async (req: Request, res: Response) => {
    // TypeScript knows req.body is of type Book!
    const book: Book = req.body;
    
    const newBook = {
      id: nextId++,
      ...book,
    };
    
    books.push(newBook);
    
    sendSuccess(res, newBook, 'Book created', 201, req);
  })
);

addErrorHandlers(app);
app.listen(3000);
```

---

## Advanced Features

### Custom Validation Schemas

```typescript
import { z, createPaginationSchema, createEnumSchema } from 'startup-express';

// Custom pagination with max limit
const customPagination = createPaginationSchema(50);

// Custom enum with error message
const statusEnum = createEnumSchema(
  ['draft', 'published', 'archived'],
  'status'
);

// Combined schema
const getPostsSchema = z.object({
  ...customPagination.shape,
  status: statusEnum.optional(),
  author: z.string().optional(),
});
```

### Nested Object Validation

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
});

const userSchema = z.object({
  name: z.string(),
  email: commonSchemas.email,
  address: addressSchema,
  contacts: z.array(z.object({
    type: z.enum(['phone', 'email']),
    value: z.string(),
  })),
});
```

### Conditional Validation

```typescript
const paymentSchema = z.object({
  method: z.enum(['card', 'paypal', 'bank']),
  amount: z.number().positive(),
}).refine(
  (data) => {
    // Require card details if method is 'card'
    if (data.method === 'card' && !data.cardNumber) {
      return false;
    }
    return true;
  },
  {
    message: 'Card number required for card payments',
    path: ['cardNumber'],
  }
);
```

### Schema Transformation

```typescript
const userInputSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  age: z.string().transform(val => parseInt(val, 10)),
  tags: z.string().transform(val => val.split(',')),
});

// Input: { email: " TEST@EXAMPLE.COM ", age: "25", tags: "tag1,tag2" }
// Output: { email: "test@example.com", age: 25, tags: ["tag1", "tag2"] }
```

### Multiple Endpoints with Shared Logic

```typescript
// Shared middleware
const authenticate = (req, res, next) => {
  // Authentication logic
  next();
};

const authorize = (roles: string[]) => (req, res, next) => {
  // Authorization logic
  next();
};

// Protected routes
app.get('/admin/users',
  authenticate,
  authorize(['admin']),
  catchAsync(async (req, res) => {
    // Admin-only logic
  })
);

app.get('/api/profile',
  authenticate,
  catchAsync(async (req, res) => {
    // User profile logic
  })
);
```

---

## Environment Configuration

Create `.env` file:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=mongodb://localhost:27017/myapp

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# API Keys
STRIPE_KEY=sk_test_...
SENDGRID_KEY=SG...
```

Use in code:

```typescript
import { getEnv, getEnvNumber, getEnvBoolean } from 'startup-express';

const config = {
  port: getEnvNumber('PORT', 3000),
  database: getEnv('DATABASE_URL'),
  jwtSecret: getEnv('JWT_SECRET'),
  debug: getEnvBoolean('DEBUG', false),
};
```

---

## Error Handling Patterns

```typescript
// Custom error handler for specific routes
app.get('/data',
  catchAsync(async (req, res) => {
    try {
      const data = await fetchData();
      sendSuccess(res, data);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw AppError.internal('Database connection failed');
      }
      throw error;
    }
  })
);

// Validation with custom error
app.post('/items',
  validate(itemSchema, 'body'),
  catchAsync(async (req, res) => {
    const exists = await checkExists(req.body.name);
    if (exists) {
      throw AppError.conflict('Item already exists', {
        name: req.body.name,
      });
    }
    // Create item
  })
);
```

---

## Rate Limiting Patterns

```typescript
import { rateLimitMiddleware, strictRateLimitMiddleware } from 'startup-express';

// Custom rate limits for different routes
app.use('/api/public', rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

app.use('/api/authenticated', rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 1000,
}));

// Very strict for sensitive operations
app.post('/auth/login', strictRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 5,
}), loginHandler);

app.post('/auth/forgot-password', strictRateLimitMiddleware({
  windowMs: 60 * 60 * 1000,
  max: 3,
}), forgotPasswordHandler);
```

---

For more information, see:
- [README.md](README.md) - Main documentation
- [API_REFERENCE.md](API_REFERENCE.md) - Complete API reference
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide

