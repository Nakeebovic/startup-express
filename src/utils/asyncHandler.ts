import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper for async route handlers that catches errors and passes them to error middleware
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Alias for consistency with documentation
export const asyncHandler = catchAsync;

