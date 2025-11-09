import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

/**
 * Middleware to track request timing
 * Adds X-Response-Time header and logs slow requests
 */
export const timingMiddleware = (options: { slowRequestThreshold?: number } = {}) => {
  const { slowRequestThreshold = 1000 } = options; // 1 second default

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    req.startTime = startTime;

    // Listen for response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Add response time header
      res.setHeader('X-Response-Time', `${duration}ms`);
      
      // Log slow requests
      if (duration > slowRequestThreshold) {
        logger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          duration: `${duration}ms`,
          requestId: req.requestId,
        });
      }
    });

    next();
  };
};

