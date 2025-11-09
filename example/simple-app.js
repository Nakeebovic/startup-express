// Simple JavaScript example
const express = require('express');
const { setupExpress, addErrorHandlers, logger, AppError, asyncHandler } = require('startup-express');
const { StatusCodes } = require('http-status-codes');

const app = express();

// Setup all middleware with default configuration
setupExpress(app);

// Sample data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the API',
    endpoints: {
      users: '/api/users',
      health: '/health',
    },
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: users,
  });
});

// Get user by ID
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }
  
  res.json({
    success: true,
    data: user,
  });
}));

// Add error handlers (must be last)
addErrorHandlers(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📝 Try http://localhost:${PORT}/health`);
});

