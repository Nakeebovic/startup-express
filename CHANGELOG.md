# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### 🎉 Initial Release

First production-ready release of Startup Express with comprehensive features for building Express.js applications.

### Added

**Validation**
- Zod-based request validation with TypeScript type inference
- `validate()` function for single-source validation
- `validateAll()` for multi-source validation (body, query, params, headers)
- `createValidatedHandler()` for type-safe route handlers
- Common validation schemas (`email`, `password`, `objectId`, `uuid`, `url`, etc.)
- `createPaginationSchema()` and `createEnumSchema()` helper functions

**Error Handling**
- `AppError` class with structured error codes
- Static error methods (`badRequest()`, `unauthorized()`, `notFound()`, etc.)
- `catchAsync()` wrapper for async route handlers
- Global error handlers for unhandled rejections and exceptions
- Automatic Zod validation error formatting
- Development vs production error responses

**Response Helpers**
- `sendSuccess()` - Send success responses with metadata
- `sendCreated()` - Send 201 Created responses
- `sendPaginated()` - Send paginated responses with metadata
- `sendAccepted()` - Send 202 Accepted responses
- `sendNoContent()` - Send 204 No Content responses
- `getPaginationOffset()` and `createPaginationMeta()` utilities

**Middleware**
- `setupExpress()` - One-line Express app configuration
- `helmetMiddleware()` - Security headers (Helmet)
- `corsMiddleware()` - CORS configuration
- `compressionMiddleware()` - Response compression
- `rateLimitMiddleware()` - Standard rate limiting
- `strictRateLimitMiddleware()` - Strict rate limiting for sensitive routes
- `requestIdMiddleware()` - Unique request ID generation and tracking
- `timingMiddleware()` - Request timing with slow request detection
- `sanitizeMiddleware()` - NoSQL injection protection
- `morganMiddleware()` - HTTP request logging
- `jsonMiddleware()` and `urlencodedMiddleware()` - Body parsing

**Logging**
- Winston logger with console and file transports
- Automatic log rotation in production
- Context-aware logging with request IDs
- Colorized console output in development
- Log levels: `debug`, `info`, `warn`, `error`

**Configuration**
- Environment variable management utilities
- `config` object with environment detection
- `getEnv()`, `getEnvNumber()`, `getEnvBoolean()` helper functions
- Configurable middleware through `StartupExpressConfig`

**Health Checks**
- `/health` endpoint with detailed server info
- `/ready` endpoint for container orchestration (Kubernetes, Docker)
- Uptime and environment information

**Request Tracking**
- Automatic unique ID for every request
- Request IDs in logs, responses, and error messages
- Configurable request ID header
- X-Response-Time header on all responses

**TypeScript Support**
- Full TypeScript type definitions
- Extended Express Request type with `requestId` and `startTime`
- Type inference from Zod schemas
- Comprehensive interfaces and types

**Security**
- Helmet security headers by default
- NoSQL injection protection
- Rate limiting to prevent abuse
- Input sanitization
- Trust proxy configuration
- X-Powered-By header disabled

### Dependencies

**Runtime:**
- `zod@^3.22.4` - TypeScript-first validation
- `nanoid@^3.3.7` - Request ID generation
- `helmet@^7.1.0` - Security headers
- `cors@^2.8.5` - CORS support
- `compression@^1.7.4` - Response compression
- `express-rate-limit@^7.1.5` - Rate limiting
- `morgan@^1.10.0` - HTTP logging
- `dotenv@^16.3.1` - Environment variables
- `winston@^3.11.0` - Advanced logging
- `express-async-errors@^3.1.1` - Async error handling
- `http-status-codes@^2.3.0` - HTTP status constants

**Peer Dependencies:**
- `express@^4.18.0 || ^5.0.0`

### Documentation

- **README.md** - Main documentation with features and examples
- **QUICKSTART.md** - 5-minute getting started guide
- **API_REFERENCE.md** - Complete API documentation
- **EXAMPLE.md** - Full REST API examples
- **CHANGELOG.md** - This file
- **CONTRIBUTING.md** - Contribution guidelines

### Examples

- Basic JavaScript example (`example/simple-app.js`)
- TypeScript example (`example/typescript-app.ts`)
- Advanced TypeScript example with CRUD (`example/advanced-typescript-app.ts`)

---

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for breaking changes
- **MINOR** version for new features (backward compatible)
- **PATCH** version for bug fixes (backward compatible)

## Upgrading

To upgrade to a new version:

```bash
npm install startup-express@latest
```

Check the CHANGELOG for any breaking changes or new features.

---

For questions or issues, please visit: https://github.com/Nakeebovic/startup-express/issues

