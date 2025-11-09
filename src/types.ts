import { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any[];
  stack?: string;
  errorCode?: string;
  requestId?: string;
  timestamp?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp?: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export interface StartupExpressConfig {
  cors?: {
    enabled?: boolean;
    origin?: string | string[];
    credentials?: boolean;
  };
  helmet?: {
    enabled?: boolean;
  };
  compression?: {
    enabled?: boolean;
  };
  rateLimit?: {
    enabled?: boolean;
    windowMs?: number;
    max?: number;
  };
  logging?: {
    enabled?: boolean;
    format?: 'dev' | 'combined' | 'common' | 'short' | 'tiny';
  };
  errorHandler?: {
    enabled?: boolean;
    showStack?: boolean;
  };
  requestId?: {
    enabled?: boolean;
    header?: string;
  };
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export enum ErrorCode {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode: ErrorCode;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any) {
    return new AppError(message, 400, ErrorCode.BAD_REQUEST, details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: any) {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED, details);
  }

  static forbidden(message: string = 'Forbidden', details?: any) {
    return new AppError(message, 403, ErrorCode.FORBIDDEN, details);
  }

  static notFound(message: string = 'Resource not found', details?: any) {
    return new AppError(message, 404, ErrorCode.NOT_FOUND, details);
  }

  static conflict(message: string, details?: any) {
    return new AppError(message, 409, ErrorCode.CONFLICT, details);
  }

  static validation(message: string, details?: any) {
    return new AppError(message, 422, ErrorCode.VALIDATION_ERROR, details);
  }

  static internal(message: string = 'Internal server error', details?: any) {
    return new AppError(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, details);
  }
}

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}
