import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';
import { StatusCodes } from 'http-status-codes';

// Re-export Zod for convenience
export { z, ZodSchema, ZodError } from 'zod';

export type ValidationSource = 'body' | 'query' | 'params' | 'headers';

export interface ValidateOptions {
  /** Whether to strip unknown keys (default: false) */
  stripUnknown?: boolean;
  /** Whether to abort validation on first error (default: false) */
  abortEarly?: boolean;
}

/**
 * Middleware to validate request data using Zod schemas
 * @param schema - Zod schema for validation
 * @param source - Where to validate: 'body', 'query', 'params', or 'headers'
 * @param options - Validation options
 */
export const validate = (
  schema: ZodSchema,
  source: ValidationSource = 'body',
  _options: ValidateOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[source];
      
      // Parse and validate data
      const validated = schema.parse(data);
      
      // Replace request data with validated data (ensures type safety)
      req[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      
      next(error);
    }
  };
};

/**
 * Validate multiple sources at once
 * @param schemas - Object with schemas for different sources
 */
export const validateAll = (schemas: Partial<Record<ValidationSource, ZodSchema>>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: Array<{ source: string; field: string; message: string }> = [];

      // Validate all specified sources
      for (const [source, schema] of Object.entries(schemas)) {
        try {
          const data = req[source as ValidationSource];
          const validated = schema.parse(data);
          req[source as ValidationSource] = validated;
        } catch (error) {
          if (error instanceof ZodError) {
            error.errors.forEach((err) => {
              errors.push({
                source,
                field: err.path.join('.'),
                message: err.message,
              });
            });
          }
        }
      }

      if (errors.length > 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Create a type-safe request handler with validated inputs
 */
export const createValidatedHandler = <TBody = any, TQuery = any, TParams = any>(
  schemas: {
    body?: ZodSchema<TBody>;
    query?: ZodSchema<TQuery>;
    params?: ZodSchema<TParams>;
  },
  handler: (
    req: Request<TParams, any, TBody, TQuery>,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void
) => {
  return [
    validateAll(schemas as any),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req as any, res, next);
      } catch (error) {
        next(error);
      }
    },
  ];
};

// Common validation schemas
export const commonSchemas = {
  /** MongoDB ObjectId */
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  
  /** UUID v4 */
  uuid: z.string().uuid(),
  
  /** Email */
  email: z.string().email().toLowerCase(),
  
  /** Strong password */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  
  /** URL */
  url: z.string().url(),
  
  /** Date string (ISO 8601) */
  dateString: z.string().datetime(),
  
  /** Pagination */
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
  
  /** Search query */
  search: z.object({
    q: z.string().min(1).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),
};

/**
 * Utility to create pagination schema
 */
export const createPaginationSchema = (maxLimit = 100) => {
  return z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(maxLimit).default(10),
  });
};

/**
 * Utility to create enum schema with custom error message
 */
export const createEnumSchema = <T extends readonly [string, ...string[]]>(
  values: T,
  fieldName: string = 'value'
) => {
  return z.enum(values, {
    errorMap: () => ({
      message: `${fieldName} must be one of: ${values.join(', ')}`,
    }),
  });
};
