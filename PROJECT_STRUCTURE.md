# Project Structure

Complete overview of the Startup Express package structure and organization.

## Directory Structure

```
startup-express/
├── 📄 Package Configuration
│   ├── package.json           # Package metadata and dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── jest.config.js         # Jest test configuration
│   ├── .eslintrc.json         # ESLint rules
│   ├── .prettierrc.json       # Prettier formatting rules
│   ├── .editorconfig          # Editor configuration
│   ├── .gitignore             # Git ignore rules
│   └── .npmignore             # npm ignore rules
│
├── 📚 Documentation (8 files)
│   ├── README.md              # Main package documentation
│   ├── QUICKSTART.md          # 5-minute quick start guide
│   ├── API_REFERENCE.md       # Complete API documentation
│   ├── EXAMPLE.md             # Full code examples
│   ├── GETTING_STARTED.md     # Setup and development guide
│   ├── CONTRIBUTING.md        # Contribution guidelines
│   ├── PUBLISHING.md          # Publishing to npm guide
│   ├── CHANGELOG.md           # Version history
│   ├── PROJECT_STRUCTURE.md   # This file
│   └── LICENSE                # MIT license
│
├── 💻 Source Code (src/)
│   ├── index.ts               # Main entry point & exports
│   ├── setup.ts               # setupExpress & addErrorHandlers
│   ├── config.ts              # Environment configuration
│   ├── logger.ts              # Winston logger setup
│   ├── errorHandler.ts        # Error handling logic
│   ├── types.ts               # TypeScript type definitions
│   │
│   ├── middleware/            # Express middleware (10 files)
│   │   ├── index.ts           # Middleware exports
│   │   ├── bodyParser.ts      # JSON/urlencoded parsing
│   │   ├── compression.ts     # Response compression
│   │   ├── cors.ts            # CORS configuration
│   │   ├── helmet.ts          # Security headers
│   │   ├── morgan.ts          # HTTP logging
│   │   ├── rateLimit.ts       # Rate limiting
│   │   ├── requestId.ts       # Request ID tracking
│   │   ├── sanitize.ts        # Input sanitization
│   │   └── timing.ts          # Request timing
│   │
│   ├── utils/                 # Utility functions
│   │   ├── index.ts           # Utils exports
│   │   ├── asyncHandler.ts    # Async error wrapper
│   │   └── responseHelpers.ts # Response helper functions
│   │
│   ├── validators/            # Validation utilities
│   │   └── index.ts           # Zod validation functions
│   │
│   └── __tests__/             # Test files
│       ├── setup.test.ts      # Setup function tests
│       ├── errorHandler.test.ts # Error handling tests
│       ├── config.test.ts     # Config utilities tests
│       └── validators.test.ts # Validation tests
│
├── 📝 Examples
│   ├── simple-app.js          # Basic JavaScript example
│   ├── typescript-app.ts      # TypeScript example
│   ├── advanced-typescript-app.ts # Full CRUD example
│   ├── package.json           # Example dependencies
│   └── README.md              # Examples documentation
│
├── 🏗️ Build Output (generated)
│   └── dist/                  # Compiled JavaScript & types
│       ├── index.js
│       ├── index.d.ts
│       ├── middleware/
│       ├── utils/
│       ├── validators/
│       └── ...
│
└── ⚙️ CI/CD
    └── .github/workflows/
        └── ci.yml             # GitHub Actions workflow
```

## Core Files

### `src/index.ts`

Main entry point that exports all public APIs:

```typescript
export * from './middleware';
export * from './logger';
export * from './errorHandler';
export * from './validators';
export * from './config';
export * from './types';
export * from './utils';
export { setupExpress, addErrorHandlers } from './setup';
```

### `src/setup.ts`

Core setup functions:
- `setupExpress(app, config?)` - Configure Express with all middleware
- `addErrorHandlers(app)` - Add 404 and global error handlers

### `src/types.ts`

TypeScript type definitions:
- `StartupExpressConfig` - Configuration interface
- `AppError` - Custom error class with static methods
- `ErrorCode` - Error code enum
- `ErrorResponse` - Error response interface
- `SuccessResponse<T>` - Success response interface
- `PaginationMeta` - Pagination metadata
- Extended Express Request type

### `src/config.ts`

Environment configuration:
- `config` object with environment detection
- `getEnv()` - Get string environment variable
- `getEnvNumber()` - Get number environment variable
- `getEnvBoolean()` - Get boolean environment variable

### `src/logger.ts`

Winston logger configuration:
- Console logging in development
- File logging in production
- Automatic log rotation
- Custom formatting

### `src/errorHandler.ts`

Error handling:
- `errorHandler` - Global error handler middleware
- `notFoundHandler` - 404 handler
- `setupGlobalErrorHandlers()` - Handle unhandled rejections
- Zod error formatting
- Development vs production mode handling

## Middleware Directory

### `src/middleware/index.ts`

Exports all middleware:

```typescript
export { corsMiddleware } from './cors';
export { helmetMiddleware } from './helmet';
export { compressionMiddleware } from './compression';
export { rateLimitMiddleware, strictRateLimitMiddleware } from './rateLimit';
export { morganMiddleware } from './morgan';
export { jsonMiddleware, urlencodedMiddleware } from './bodyParser';
export { requestIdMiddleware } from './requestId';
export { timingMiddleware } from './timing';
export { sanitizeMiddleware } from './sanitize';
```

### Middleware Files

- **bodyParser.ts** - JSON and URL-encoded body parsing
- **compression.ts** - Gzip compression for responses
- **cors.ts** - Cross-Origin Resource Sharing configuration
- **helmet.ts** - Security headers
- **morgan.ts** - HTTP request logging
- **rateLimit.ts** - Standard and strict rate limiting
- **requestId.ts** - Unique ID generation for requests
- **sanitize.ts** - NoSQL injection protection
- **timing.ts** - Request timing and slow request detection

## Utils Directory

### `src/utils/responseHelpers.ts`

Response helper functions:
- `sendSuccess()` - Send success response
- `sendCreated()` - Send 201 Created response
- `sendPaginated()` - Send paginated response
- `sendAccepted()` - Send 202 Accepted response
- `sendNoContent()` - Send 204 No Content response
- `getPaginationOffset()` - Calculate pagination offset
- `createPaginationMeta()` - Create pagination metadata

### `src/utils/asyncHandler.ts`

Async error wrapper:
- `catchAsync()` - Wrap async route handlers
- `asyncHandler` - Alias for catchAsync

## Validators Directory

### `src/validators/index.ts`

Zod validation utilities:
- `validate()` - Validate single source
- `validateAll()` - Validate multiple sources
- `createValidatedHandler()` - Type-safe handler wrapper
- `commonSchemas` - Pre-built validation schemas
- `createPaginationSchema()` - Custom pagination schema
- `createEnumSchema()` - Custom enum schema
- `z` - Re-exported Zod library

## Tests Directory

### Test Files

- **setup.test.ts** - Tests for setup functions
- **errorHandler.test.ts** - Tests for error handling
- **config.test.ts** - Tests for configuration utilities
- **validators.test.ts** - Tests for validation functions

## Configuration Files

### `package.json`

Package metadata:
- Name, version, description
- Scripts (build, test, lint, format)
- Dependencies (runtime)
- DevDependencies (development tools)
- Peer dependencies (Express)
- Repository and author info

### `tsconfig.json`

TypeScript configuration:
- Target: ES2020
- Module: CommonJS
- Output: dist/
- Declaration files generated
- Strict mode enabled

### `jest.config.js`

Test configuration:
- ts-jest preset
- Test environment: Node.js
- Coverage collection enabled
- Test patterns

### `.eslintrc.json`

Linting rules:
- TypeScript ESLint parser
- Recommended rules
- Custom rule overrides

### `.prettierrc.json`

Code formatting:
- Single quotes
- Semicolons
- 2 space indentation
- 100 character line width

## Build Process

### Development

```bash
npm install      # Install dependencies
npm run build    # Compile TypeScript
npm test         # Run tests
npm run lint     # Check linting
npm run format   # Format code
```

### Build Output (`dist/`)

Compiled JavaScript and type definitions:
```
dist/
├── index.js
├── index.d.ts
├── setup.js
├── setup.d.ts
├── middleware/
│   ├── cors.js
│   ├── cors.d.ts
│   └── ...
└── ...
```

## Examples

### `example/simple-app.js`

Basic JavaScript example demonstrating:
- Simple setup
- Basic routes
- Error handling

### `example/typescript-app.ts`

TypeScript example with:
- Type-safe setup
- Validation
- Error handling

### `example/advanced-typescript-app.ts`

Complete REST API with:
- Full CRUD operations
- Pagination and filtering
- Validation schemas
- Error handling
- Request tracking

## Package Publishing

### Files Included in npm Package

Defined by `.npmignore`:
- `dist/` - Compiled code
- `package.json`
- `README.md`
- `LICENSE`
- `CHANGELOG.md`

### Files Excluded from npm Package

- `src/` - Source TypeScript
- `__tests__/` - Test files
- Configuration files
- Examples
- Development files

## Documentation Overview

| File | Purpose | Audience |
|------|---------|----------|
| README.md | Main documentation | All users |
| QUICKSTART.md | Quick start guide | New users |
| API_REFERENCE.md | API documentation | All users |
| EXAMPLE.md | Code examples | All users |
| GETTING_STARTED.md | Setup guide | Users & contributors |
| CONTRIBUTING.md | Contribution guide | Contributors |
| PUBLISHING.md | Publishing guide | Maintainers |
| CHANGELOG.md | Version history | All users |
| PROJECT_STRUCTURE.md | This file | Contributors |

## Development Workflow

1. **Make changes** in `src/`
2. **Add tests** in `src/__tests__/`
3. **Build**: `npm run build`
4. **Test**: `npm test`
5. **Lint**: `npm run lint`
6. **Format**: `npm run format`
7. **Update docs** as needed
8. **Commit** and push changes

## Dependencies

### Runtime Dependencies

- **zod** - TypeScript-first validation
- **helmet** - Security headers
- **cors** - CORS support
- **compression** - Response compression
- **express-rate-limit** - Rate limiting
- **morgan** - HTTP logging
- **winston** - Advanced logging
- **dotenv** - Environment variables
- **nanoid** - Request ID generation
- **http-status-codes** - HTTP status constants
- **express-async-errors** - Async error handling

### Peer Dependencies

- **express** - Express.js framework (4.x or 5.x)

### Development Dependencies

- **TypeScript** - TypeScript compiler
- **Jest** - Testing framework
- **ts-jest** - TypeScript Jest support
- **ESLint** - Linting
- **Prettier** - Code formatting
- **supertest** - HTTP testing
- Type definitions for all dependencies

## Key Features by Location

### Security
- `src/middleware/helmet.ts` - Security headers
- `src/middleware/sanitize.ts` - Input sanitization
- `src/middleware/rateLimit.ts` - Rate limiting
- `src/middleware/cors.ts` - CORS

### Validation
- `src/validators/index.ts` - Zod validation
- Pre-built common schemas
- Type-safe validation

### Error Handling
- `src/errorHandler.ts` - Error handlers
- `src/types.ts` - AppError class
- Structured error codes

### Logging
- `src/logger.ts` - Winston logger
- `src/middleware/morgan.ts` - HTTP logging
- Context-aware logging

### Performance
- `src/middleware/compression.ts` - Response compression
- `src/middleware/timing.ts` - Request timing
- Optimized middleware order

### Request Tracking
- `src/middleware/requestId.ts` - Unique IDs
- Included in logs and responses
- Debugging support

---

For more information, see:
- [README.md](README.md) - Main documentation
- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines

---

## 👤 Author

**Ahmed El Nakeeb (Nakeebovic)**
- GitHub: [@Nakeebovic](https://github.com/Nakeebovic)
- npm: [nakeebovic](https://www.npmjs.com/~nakeebovic)

