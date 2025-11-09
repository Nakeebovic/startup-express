import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to sanitize request data
 * Removes potentially dangerous characters and patterns
 */
export const sanitizeMiddleware = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query
    if (req.query) {
      req.query = sanitizeObject(req.query as any);
    }

    // Sanitize params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  };
};

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove keys that start with $
    if (key.startsWith('$')) {
      continue;
    }
    
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
}

/**
 * Sanitize a single value
 */
function sanitizeValue(value: any): any {
  if (typeof value !== 'string') {
    return value;
  }

  // Remove potential NoSQL injection patterns
  value = value.replace(/\$where/gi, '');
  value = value.replace(/\$ne/gi, '');
  value = value.replace(/\$gt/gi, '');
  value = value.replace(/\$lt/gi, '');
  
  return value;
}

