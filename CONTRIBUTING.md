# Contributing to Startup Express

Thank you for your interest in contributing to Startup Express! This document provides guidelines for contributing to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## 🐛 Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

### How to Report a Bug

1. Use the GitHub issue tracker
2. Include a clear and descriptive title
3. Provide steps to reproduce the issue
4. Describe expected vs actual behavior
5. Include your environment details:
   - Node.js version
   - Express version
   - Package version
   - Operating system
6. Add code samples if applicable

**Example:**

```markdown
### Bug: Validation fails for valid email

**Steps to reproduce:**
1. Install startup-express@1.0.0
2. Use commonSchemas.email
3. Pass valid email: test@example.com

**Expected:** Validation passes
**Actual:** Validation fails with error...

**Environment:**
- Node.js: 20.10.0
- Express: 4.18.2
- Package: 1.0.0
- OS: macOS 14.0
```

## 💡 Suggesting Features

We welcome feature suggestions! Please provide:

1. Clear and descriptive title
2. Detailed description of the proposed feature
3. Use cases and examples
4. Why this feature would be useful
5. Possible implementation approach

## 🔧 Pull Requests

### Before Starting

1. Check existing PRs to avoid duplication
2. Discuss major changes in an issue first
3. Fork the repository
4. Create a feature branch

### Development Setup

```bash
# Clone your fork
git clone https://github.com/Nakeebovic/startup-express.git
cd startup-express

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### Making Changes

1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation
   - Keep commits focused and clear

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide clear description
   - Link related issues
   - Add screenshots if applicable

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(validation): add phone number schema
fix(error): correct status code for validation errors
docs(readme): update installation instructions
test(middleware): add tests for rate limiting
```

## 📝 Code Style

### TypeScript

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Example

```typescript
/**
 * Validate request data using Zod schema
 * @param schema - Zod validation schema
 * @param source - Request source to validate
 * @returns Express middleware function
 */
export const validate = (
  schema: ZodSchema,
  source: ValidationSource = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
  };
};
```

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Max line length: 100 characters
- Run `npm run format` before committing

## 🧪 Testing

### Writing Tests

- Write tests for all new features
- Ensure existing tests pass
- Test edge cases and error conditions
- Use descriptive test names

### Example

```typescript
describe('validate', () => {
  it('should validate valid data', async () => {
    const schema = z.object({ name: z.string() });
    const req = mockRequest({ name: 'John' });
    const res = mockResponse();
    
    await validate(schema, 'body')(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  it('should reject invalid data', async () => {
    // Test implementation
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- validators.test.ts

# Run with coverage
npm test -- --coverage
```

## 📖 Documentation

### Update Documentation When:

- Adding new features
- Changing existing APIs
- Fixing bugs that affect usage
- Improving examples

### Documentation Files

- `README.md` - Main documentation
- `API_REFERENCE.md` - API details
- `QUICKSTART.md` - Getting started guide
- `EXAMPLE.md` - Code examples
- `CHANGELOG.md` - Version history

### Documentation Style

- Use clear, concise language
- Provide code examples
- Include expected output
- Add troubleshooting tips

## 🏗️ Project Structure

```
startup-express/
├── src/                  # Source code
│   ├── middleware/       # Middleware functions
│   ├── utils/            # Utility functions
│   ├── validators/       # Validation utilities
│   ├── __tests__/        # Test files
│   ├── config.ts         # Configuration
│   ├── errorHandler.ts   # Error handling
│   ├── logger.ts         # Logging setup
│   ├── setup.ts          # Main setup
│   ├── types.ts          # TypeScript types
│   └── index.ts          # Main exports
├── example/              # Example applications
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── jest.config.js        # Jest configuration
```

## 🎯 Development Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Commit** with clear messages
7. **Push** to your fork
8. **Create** a pull request
9. **Respond** to review feedback
10. **Celebrate** when merged! 🎉

## ✅ Pull Request Checklist

Before submitting your PR:

- [ ] Code builds without errors (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (for significant changes)
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

## 🔄 Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, maintainers will merge
4. Your contribution will be in the next release!

## 📋 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## 🙏 Recognition

Contributors will be:
- Listed in release notes
- Credited in documentation
- Appreciated by the community! ❤️

## 💬 Questions?

- Open an issue with the `question` label
- Start a discussion on GitHub
- Check existing issues and discussions

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making Startup Express better! 🚀

