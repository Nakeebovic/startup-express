import rateLimit, { Options } from 'express-rate-limit';

export const rateLimitMiddleware = (options?: Partial<Options>) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

// Strict rate limiter for sensitive endpoints (e.g., login, signup)
export const strictRateLimitMiddleware = (options?: Partial<Options>) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

