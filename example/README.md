# Startup Express Examples

This directory contains example applications demonstrating how to use the `startup-express` package.

## Examples

### 1. Simple JavaScript App (`simple-app.js`)

A minimal Express.js application using CommonJS syntax.

**Run:**
```bash
npm install
npm run simple
```

**Test:**
```bash
# Health check
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1

# Get non-existent user (error handling demo)
curl http://localhost:3000/api/users/999
```

### 2. TypeScript App (`typescript-app.ts`)

A complete REST API with full CRUD operations using TypeScript.

**Run:**
```bash
npm install
npm run typescript
```

**Test:**
```bash
# Get all users
curl http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Wilson","email":"bob@example.com"}'

# Update a user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated"}'

# Delete a user
curl -X DELETE http://localhost:3000/api/users/1

# Validation error demo
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"invalid-email"}'
```

## Features Demonstrated

- ✅ Easy setup with `setupExpress()`
- ✅ Custom configuration options
- ✅ Error handling with `AppError`
- ✅ Async route handlers with `asyncHandler`
- ✅ Request validation with `validate()`
- ✅ Response helpers (`sendSuccess`, `sendCreated`)
- ✅ Winston logger integration
- ✅ Health check endpoint
- ✅ TypeScript support
- ✅ Proper HTTP status codes

## Next Steps

After trying these examples, check out:
- [Full Documentation](../README.md)
- [Complete Example with Database](../EXAMPLE.md)

