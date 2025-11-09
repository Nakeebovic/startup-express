// Advanced TypeScript example with Zod validation
import express, { Request, Response } from 'express';
import {
  setupExpress,
  addErrorHandlers,
  logger,
  AppError,
  catchAsync,
  validate,
  z,
  commonSchemas,
  sendSuccess,
  sendCreated,
  sendPaginated,
  ErrorCode,
} from 'startup-express';

const app = express();

// Setup middleware with custom configuration
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
  requestId: {
    enabled: true,
    header: 'X-Request-Id',
  },
});

// ============================================
// Zod Schemas
// ============================================

// User schemas
const createUserSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  name: z.string().min(2).max(50).trim(),
  age: z.number().int().min(18).max(120).optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

const updateUserSchema = z.object({
  email: commonSchemas.email.optional(),
  name: z.string().min(2).max(50).trim().optional(),
  age: z.number().int().min(18).max(120).optional(),
});

const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// Mock Database
// ============================================

interface User {
  id: number;
  email: string;
  name: string;
  age?: number;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

let users: User[] = [
  {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    age: 30,
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    email: 'jane@example.com',
    name: 'Jane Smith',
    age: 28,
    role: 'admin',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];
let nextId = 3;

// ============================================
// Routes
// ============================================

// Root endpoint
app.get('/', (_req, res) => {
  sendSuccess(res, {
    name: 'Advanced API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      ready: '/ready',
      users: '/api/v1/users',
    },
  });
});

// Get all users with pagination and filtering
app.get(
  '/api/v1/users',
  validate(getUsersQuerySchema, 'query'),
  catchAsync(async (req: Request, res: Response) => {
    const query = req.query as z.infer<typeof getUsersQuerySchema>;
    
    // Filter users
    let filteredUsers = users;
    
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (query.role) {
      filteredUsers = filteredUsers.filter((u) => u.role === query.role);
    }
    
    // Sort users
    filteredUsers.sort((a, b) => {
      const aValue = a[query.sortBy as keyof User];
      const bValue = b[query.sortBy as keyof User];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return query.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return query.order === 'asc'
        ? (aValue as any) - (bValue as any)
        : (bValue as any) - (aValue as any);
    });
    
    // Paginate
    const total = filteredUsers.length;
    const start = (query.page - 1) * query.limit;
    const paginatedUsers = filteredUsers.slice(start, start + query.limit);
    
    // Remove password from response
    const safeUsers = paginatedUsers.map(({ ...user }) => user);
    
    sendPaginated(
      res,
      safeUsers,
      {
        page: query.page,
        limit: query.limit,
        total,
      },
      req
    );
  })
);

// Get user by ID
app.get(
  '/api/v1/users/:id',
  validate(userIdSchema, 'params'),
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as z.infer<typeof userIdSchema>;
    
    const user = users.find((u) => u.id === id);
    
    if (!user) {
      throw AppError.notFound('User not found', { userId: id });
    }
    
    // Remove sensitive data
    const { ...safeUser } = user;
    
    sendSuccess(res, safeUser, undefined, 200, req);
  })
);

// Create user
app.post(
  '/api/v1/users',
  validate(createUserSchema, 'body'),
  catchAsync(async (req: Request, res: Response) => {
    const data = req.body as z.infer<typeof createUserSchema>;
    
    // Check if email already exists
    if (users.some((u) => u.email === data.email)) {
      throw AppError.conflict('Email already exists', { email: data.email });
    }
    
    // Create new user
    const newUser: User = {
      id: nextId++,
      email: data.email,
      name: data.name,
      age: data.age,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    users.push(newUser);
    
    logger.info('User created', {
      userId: newUser.id,
      email: newUser.email,
      requestId: req.requestId,
    });
    
    // Remove sensitive data
    const { ...safeUser } = newUser;
    
    sendCreated(res, safeUser, 'User created successfully', req);
  })
);

// Update user
app.put(
  '/api/v1/users/:id',
  validate(userIdSchema, 'params'),
  validate(updateUserSchema, 'body'),
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as z.infer<typeof userIdSchema>;
    const data = req.body as z.infer<typeof updateUserSchema>;
    
    const userIndex = users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      throw AppError.notFound('User not found', { userId: id });
    }
    
    // Check email uniqueness if updating email
    if (data.email && users.some((u) => u.email === data.email && u.id !== id)) {
      throw AppError.conflict('Email already exists', { email: data.email });
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...data,
      updatedAt: new Date(),
    };
    
    logger.info('User updated', {
      userId: id,
      requestId: req.requestId,
    });
    
    // Remove sensitive data
    const { ...safeUser } = users[userIndex];
    
    sendSuccess(res, safeUser, 'User updated successfully', 200, req);
  })
);

// Delete user
app.delete(
  '/api/v1/users/:id',
  validate(userIdSchema, 'params'),
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as z.infer<typeof userIdSchema>;
    
    const userIndex = users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      throw AppError.notFound('User not found', { userId: id });
    }
    
    const deletedUser = users[userIndex];
    users = users.filter((u) => u.id !== id);
    
    logger.info('User deleted', {
      userId: id,
      email: deletedUser.email,
      requestId: req.requestId,
    });
    
    sendSuccess(res, null, 'User deleted successfully', 200, req);
  })
);

// Bulk operations
app.post(
  '/api/v1/users/bulk',
  validate(
    z.object({
      users: z.array(createUserSchema).min(1).max(100),
    }),
    'body'
  ),
  catchAsync(async (req: Request, res: Response) => {
    const { users: newUsers } = req.body as {
      users: z.infer<typeof createUserSchema>[];
    };
    
    // Check for duplicate emails
    const emails = new Set(users.map((u) => u.email));
    const duplicates = newUsers.filter((u) => emails.has(u.email));
    
    if (duplicates.length > 0) {
      throw AppError.conflict('Some emails already exist', {
        duplicates: duplicates.map((u) => u.email),
      });
    }
    
    // Create all users
    const createdUsers: User[] = newUsers.map((userData) => ({
      id: nextId++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    users.push(...createdUsers);
    
    logger.info('Bulk users created', {
      count: createdUsers.length,
      requestId: req.requestId,
    });
    
    sendCreated(
      res,
      { count: createdUsers.length, users: createdUsers },
      `${createdUsers.length} users created successfully`,
      req
    );
  })
);

// Statistics endpoint
app.get('/api/v1/stats', (_req, res) => {
  const stats = {
    totalUsers: users.length,
    usersByRole: {
      user: users.filter((u) => u.role === 'user').length,
      admin: users.filter((u) => u.role === 'admin').length,
    },
    averageAge:
      users.reduce((sum, u) => sum + (u.age || 0), 0) / users.filter((u) => u.age).length || 0,
  };
  
  sendSuccess(res, stats);
});

// Error simulation endpoint (for testing)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/v1/simulate-error/:type', (req, res, next) => {
    const { type } = req.params;
    
    switch (type) {
      case 'validation':
        throw AppError.validation('Simulated validation error', {
          field: 'test',
          value: 'invalid',
        });
      case 'notfound':
        throw AppError.notFound('Simulated not found error');
      case 'unauthorized':
        throw AppError.unauthorized('Simulated unauthorized error');
      case 'internal':
        throw AppError.internal('Simulated internal error');
      case 'async':
        // Async error
        setTimeout(() => {
          throw new Error('Simulated async error');
        }, 100);
        break;
      default:
        throw new Error('Unknown error type');
    }
  });
}

// Add error handlers (must be last)
addErrorHandlers(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Advanced server running on http://localhost:${PORT}`);
  logger.info(`📝 Health check: http://localhost:${PORT}/health`);
  logger.info(`👥 Users API: http://localhost:${PORT}/api/v1/users`);
  logger.info(`📊 Stats: http://localhost:${PORT}/api/v1/stats`);
});

export default app;

