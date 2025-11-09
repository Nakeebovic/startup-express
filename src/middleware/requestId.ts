import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';

export interface RequestIdOptions {
  /** Header name to read/write request ID (default: 'X-Request-Id') */
  header?: string;
  /** Function to generate request ID (default: nanoid) */
  generator?: () => string;
}

/**
 * Middleware to add unique request ID to each request
 * Useful for tracking requests through logs and debugging
 */
export const requestIdMiddleware = (options: RequestIdOptions = {}) => {
  const {
    header = 'X-Request-Id',
    generator = () => nanoid(21),
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Use existing request ID from header or generate new one
    const requestId = (req.headers[header.toLowerCase()] as string) || generator();
    
    // Attach to request object
    req.requestId = requestId;
    
    // Add to response headers
    res.setHeader(header, requestId);
    
    next();
  };
};

