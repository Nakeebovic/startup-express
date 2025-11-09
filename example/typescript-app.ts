// TypeScript example
import express, { Request, Response } from 'express';
import {
  setupExpress,
  addErrorHandlers,
  logger,
  AppError,
  asyncHandler,
  validate,
  body,
  param,
  sendSuccess,
  sendCreated,
} from 'startup-express';
import { StatusCodes } from 'http-status-codes';

interface User {
  id: number;
  name: string;
  email: string;
}

const app = express();

// Setup middleware with custom configuration
setupExpress(app, {
  cors: {
    enabled: true,
    origin: 'http://localhost:3000',
  },
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000,
    max: 50,
  },
  logging: {
    enabled: true,
    format: 'dev',
  },
});

// Sample data
let users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];
let nextId = 3;

// Routes
app.get('/', (req: Request, res: Response) => {
  sendSuccess(res, {
    message: 'Welcome to the TypeScript API',
    endpoints: {
      users: '/api/users',
      health: '/health',
    },
  });
});

// Get all users
app.get('/api/users', (req: Request, res: Response) => {
  sendSuccess(res, users);
});

// Get user by ID
app.get(
  '/api/users/:id',
  validate([param('id').isInt({ min: 1 }).withMessage('Invalid user ID')]),
  asyncHandler(async (req: Request, res: Response) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    
    sendSuccess(res, user);
  })
);

// Create user
app.post(
  '/api/users',
  validate([
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email } = req.body;
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      throw new AppError('Email already exists', StatusCodes.CONFLICT);
    }
    
    const newUser: User = {
      id: nextId++,
      name,
      email,
    };
    
    users.push(newUser);
    logger.info(`New user created: ${email}`);
    
    sendCreated(res, newUser, 'User created successfully');
  })
);

// Update user
app.put(
  '/api/users/:id',
  validate([
    param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    
    const { name, email } = req.body;
    
    if (email && users.some(u => u.email === email && u.id !== userId)) {
      throw new AppError('Email already exists', StatusCodes.CONFLICT);
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
    };
    
    logger.info(`User updated: ${users[userIndex].email}`);
    
    sendSuccess(res, users[userIndex], 'User updated successfully');
  })
);

// Delete user
app.delete(
  '/api/users/:id',
  validate([param('id').isInt({ min: 1 }).withMessage('Invalid user ID')]),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    
    const deletedUser = users[userIndex];
    users = users.filter(u => u.id !== userId);
    
    logger.info(`User deleted: ${deletedUser.email}`);
    
    sendSuccess(res, null, 'User deleted successfully');
  })
);

// Add error handlers (must be last)
addErrorHandlers(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📝 Try http://localhost:${PORT}/health`);
  logger.info(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
});

export default app;

