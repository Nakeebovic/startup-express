import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { logger } from './logger';
import { config } from './config';
import { AppError, ErrorResponse, ErrorCode } from './types';

// Import express-async-errors to handle async errors automatically
import 'express-async-errors';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = AppError.notFound(`Route not found: ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let details: any = undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed';
    errorCode = ErrorCode.VALIDATION_ERROR;
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
  }
  // Handle operational errors
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    details = err.details;
  }
  // Handle specific error types
  else if (err.name === 'ValidationError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation Error';
    errorCode = ErrorCode.VALIDATION_ERROR;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Unauthorized';
    errorCode = ErrorCode.UNAUTHORIZED;
  } else if (err.name === 'CastError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid ID format';
    errorCode = ErrorCode.BAD_REQUEST;
  } else if ((err as any).code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    message = 'Duplicate field value';
    errorCode = ErrorCode.CONFLICT;
  } else if ((err as any).code === 'ECONNREFUSED') {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    message = 'Service unavailable';
    errorCode = ErrorCode.SERVICE_UNAVAILABLE;
  } else {
    message = err.message || message;
  }

  // Log error with context
  logger.error(`[${statusCode}] ${message}`, {
    errorCode,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...(details && { details }),
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    errorCode,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  };

  // Include additional details
  if (details) {
    errorResponse.errors = details;
  }

  // Include stack trace in development
  if (config.isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle unhandled promise rejections
 */
export const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack,
    });
    // Don't exit process in production, just log
    if (config.isDevelopment) {
      process.exit(1);
    }
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack,
    });
    // Exit process on uncaught exception
    process.exit(1);
  });
};

