# Getting Started with Startup Express

This guide will help you get started with using and developing the Startup Express package.

## For Package Users

### Installation

```bash
npm install startup-express express zod
```

### Basic Usage

```typescript
import express from 'express';
import { setupExpress, addErrorHandlers } from 'startup-express';

const app = express();

// Setup all middleware
setupExpress(app);

// Your routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Add error handlers (must be last)
addErrorHandlers(app);

app.listen(3000);
```

### Next Steps

- Read the [Quick Start Guide](QUICKSTART.md) for more examples
- Check the [API Reference](API_REFERENCE.md) for all available functions
- See [Complete Examples](EXAMPLE.md) for full REST API examples

---

## For Contributors

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nakeebovic/startup-express.git
   cd startup-express
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Run linter**
   ```bash
   npm run lint
   ```

6. **Format code**
   ```bash
   npm run format
   ```

### Project Structure

```
startup-express/
├── src/                 # Source code
│   ├── middleware/      # Middleware functions
│   ├── utils/           # Utility functions
│   ├── validators/      # Validation utilities
│   ├── __tests__/       # Test files
│   └── *.ts             # Core files
├── example/             # Example applications
├── dist/                # Compiled output (generated)
├── package.json         # Package configuration
├── tsconfig.json        # TypeScript config
└── jest.config.js       # Test configuration
```

### Development Workflow

1. **Make changes** in `src/` directory
2. **Add tests** in `src/__tests__/`
3. **Build**: `npm run build`
4. **Test**: `npm test`
5. **Lint**: `npm run lint`
6. **Format**: `npm run format`

### Testing Locally

#### Option 1: npm link

In the package directory:
```bash
npm run build
npm link
```

In your test project:
```bash
npm link startup-express
```

#### Option 2: File path

```bash
cd /path/to/test-project
npm install /path/to/startup-express
```

#### Option 3: npm pack

```bash
# In package directory
npm pack
# Creates: startup-express-1.0.0.tgz

# In test project
npm install /path/to/startup-express-1.0.0.tgz
```

### Running Examples

```bash
# Simple example
cd example
npm install
node simple-app.js

# TypeScript example
npx ts-node typescript-app.ts

# Advanced example
npx ts-node advanced-typescript-app.ts
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**
   ```bash
   npm run build
   npm test
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

### Writing Tests

Tests are located in `src/__tests__/`. Example:

```typescript
import { validate } from '../validators';
import { z } from 'zod';

describe('validate', () => {
  it('should validate valid data', async () => {
    const schema = z.object({ name: z.string() });
    const req = mockRequest({ name: 'John' });
    const res = mockResponse();
    
    await validate(schema, 'body')(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});
```

Run tests:
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
```

### Updating Documentation

When making changes:

1. Update relevant documentation files
2. Update API_REFERENCE.md if adding/changing APIs
3. Add examples to EXAMPLE.md
4. Update CHANGELOG.md

### Code Style

- Use TypeScript for all code
- Follow existing patterns
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Write tests for new features

### Before Submitting PR

- [ ] Code builds without errors
- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (for significant changes)

### Getting Help

- Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Open an issue for questions
- Read existing documentation
- Check example applications

---

## Package Features

### What's Included

**Middleware:**
- Helmet (security)
- CORS
- Compression
- Rate limiting
- Request ID tracking
- Request timing
- Input sanitization
- Body parsing
- HTTP logging

**Validation:**
- Zod schema validation
- Multi-source validation
- Common schemas
- Type inference

**Error Handling:**
- Structured error codes
- Custom AppError class
- Async error handling
- Global error handlers

**Response Helpers:**
- Success responses
- Paginated responses
- Created responses
- Metadata support

**Utilities:**
- Environment config
- Winston logger
- TypeScript types
- Health checks

### Dependencies

**Runtime:**
- zod - Validation
- helmet - Security
- cors - CORS support
- compression - Response compression
- express-rate-limit - Rate limiting
- morgan - HTTP logging
- winston - Advanced logging
- dotenv - Environment variables
- nanoid - Request ID generation
- http-status-codes - Status constants

**Dev:**
- TypeScript
- Jest
- ESLint
- Prettier

---

## Resources

- [README.md](README.md) - Main documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [API_REFERENCE.md](API_REFERENCE.md) - API documentation
- [EXAMPLE.md](EXAMPLE.md) - Complete examples
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](CHANGELOG.md) - Version history

## Support

- GitHub Issues: Report bugs or request features
- Discussions: Ask questions and share ideas
- Pull Requests: Contribute code improvements

---

## 👤 Author

**Ahmed El Nakeeb (Nakeebovic)**
- GitHub: [@Nakeebovic](https://github.com/Nakeebovic)
- npm: [nakeebovic](https://www.npmjs.com/~nakeebovic)

---

Happy coding! 🚀

