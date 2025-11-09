# 🚀 Quick Start Guide

Get up and running with Startup Express in less than 5 minutes!

## Installation

```bash
npm install startup-express express zod
```

## Minimal Setup (30 seconds)

Create `app.js`:

```javascript
const express = require('express');
const { setupExpress, addErrorHandlers, logger } = require('startup-express');

const app = express();

// Setup all middleware (one line!)
setupExpress(app);

// Your routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Add error handlers
addErrorHandlers(app);

// Start server
app.listen(3000, () => {
  logger.info('Server running on http://localhost:3000');
});
```

**That's it!** You now have:
- ✅ Security headers (Helmet)
- ✅ CORS enabled
- ✅ Request compression
- ✅ Rate limiting
- ✅ Request logging
- ✅ Error handling
- ✅ Health check at `/health`
- ✅ Request ID tracking
- ✅ Input sanitization

## Test Your Server

```bash
node app.js

# In another terminal
curl http://localhost:3000/health
curl http://localhost:3000/api/hello
```

## TypeScript Setup (2 minutes)

Create `app.ts`:

```typescript
import express from 'express';
import { setupExpress, addErrorHandlers, logger } from 'startup-express';

const app = express();
setupExpress(app);

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

addErrorHandlers(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
```

Install TypeScript dependencies:
```bash
npm install -D typescript @types/express @types/node ts-node
```

Run it:
```bash
npx ts-node app.ts
```

## Add Request Validation (Zod)

```typescript
import { z, validate, commonSchemas } from 'startup-express';

// Define schema
const createUserSchema = z.object({
  email: commonSchemas.email,
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).optional(),
});

// Use in route
app.post('/users',
  validate(createUserSchema, 'body'),
  (req, res) => {
    // req.body is now typed and validated!
    const { email, name, age } = req.body;
    res.json({ success: true, data: { email, name, age } });
  }
);
```

Test validation:
```bash
# Valid request
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"John","age":25}'

# Invalid request (see validation errors)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","name":"A","age":10}'
```

## Handle Errors Like a Pro

```typescript
import { AppError, catchAsync, sendSuccess } from 'startup-express';

app.get('/users/:id',
  catchAsync(async (req, res) => {
    const user = await findUser(req.params.id);
    
    if (!user) {
      throw AppError.notFound('User not found');
    }
    
    sendSuccess(res, user, 'User fetched', 200, req);
  })
);
```

## Custom Configuration

```typescript
setupExpress(app, {
  cors: {
    origin: 'https://yourdomain.com',
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  logging: {
    format: 'combined',
  },
  requestId: {
    enabled: true,
    header: 'X-Request-Id',
  },
});
```

## Use Individual Middleware

```typescript
import {
  helmetMiddleware,
  corsMiddleware,
  rateLimitMiddleware,
  strictRateLimitMiddleware,
} from 'startup-express';

// Custom middleware setup
app.use(helmetMiddleware());
app.use(corsMiddleware({ origin: 'https://example.com' }));
app.use(rateLimitMiddleware());

// Strict rate limiting for auth routes
app.post('/auth/login', strictRateLimitMiddleware(), loginHandler);
```

## Response Helpers

```typescript
import { sendSuccess, sendPaginated, sendCreated } from 'startup-express';

// Success response
app.get('/users', async (req, res) => {
  const users = await getUsers();
  sendSuccess(res, users, 'Users fetched', 200, req);
});

// Created response (201)
app.post('/users', async (req, res) => {
  const user = await createUser(req.body);
  sendCreated(res, user, 'User created', req);
});

// Paginated response
app.get('/items', async (req, res) => {
  const { items, total } = await getItems(req.query);
  sendPaginated(res, items, {
    page: req.query.page || 1,
    limit: req.query.limit || 10,
    total,
  }, req);
});
```

## Logging

```typescript
import { logger } from 'startup-express';

logger.info('User created', {
  userId: user.id,
  requestId: req.requestId,
});

logger.error('Database error', {
  error: err.message,
  stack: err.stack,
});
```

## Common Schemas

```typescript
import { commonSchemas } from 'startup-express';

// Use pre-built schemas
const schema = z.object({
  email: commonSchemas.email,         // Email validation
  password: commonSchemas.password,   // Strong password
  objectId: commonSchemas.objectId,   // MongoDB ID
  uuid: commonSchemas.uuid,           // UUID v4
  url: commonSchemas.url,             // Valid URL
  date: commonSchemas.dateString,     // ISO 8601 date
});

// Pagination
const querySchema = commonSchemas.pagination;
// { page: 1, limit: 10 } with defaults

// Search
const searchSchema = commonSchemas.search;
// { q, sort, order: 'asc' }
```

## Validate Multiple Sources

```typescript
import { validateAll } from 'startup-express';

app.put('/users/:id',
  validateAll({
    params: z.object({ id: z.string() }),
    body: z.object({ name: z.string() }),
    query: z.object({ notify: z.boolean().optional() }),
  }),
  handler
);
```

## Next Steps

- 📖 Read the [Complete Documentation](README.md)
- 🔍 Check [API Reference](API_REFERENCE.md)
- 💡 See [Full Examples](EXAMPLE.md)
- 🤝 Learn about [Contributing](CONTRIBUTING.md)

## Common Use Cases

### Protect Sensitive Routes
```typescript
app.post('/auth/login', strictRateLimitMiddleware(), loginHandler);
```

### Environment Variables
```typescript
import { getEnv, getEnvNumber, getEnvBoolean } from 'startup-express';

const apiKey = getEnv('API_KEY');
const port = getEnvNumber('PORT', 3000);
const debug = getEnvBoolean('DEBUG', false);
```

### Health Checks
```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## Tips

1. **Always add error handlers last** - After all routes
2. **Use `catchAsync`** for async route handlers
3. **Include request context** in logs
4. **Use common schemas** for consistency
5. **Test validation** with curl/Postman

## Need Help?

- 📚 [Full Documentation](README.md)
- 📖 [API Reference](API_REFERENCE.md)
- 💬 [GitHub Issues](https://github.com/Nakeebovic/startup-express/issues)

Happy coding! 🎉

