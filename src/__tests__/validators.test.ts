import { Request, Response } from 'express';
import { z } from 'zod';
import { validate, validateAll, commonSchemas, createPaginationSchema } from '../validators';

// Mock Express request and response
const mockRequest = (data: any = {}, source: string = 'body'): Partial<Request> => {
  const req: any = {
    body: {},
    query: {},
    params: {},
    headers: {},
  };
  req[source] = data;
  return req;
};

const mockResponse = (): Partial<Response> => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Validators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should validate valid data', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      const req = mockRequest({ email: 'test@example.com', age: 25 });
      const res = mockResponse();

      const middleware = validate(schema, 'body');
      await middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid data', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      const req = mockRequest({ email: 'invalid-email', age: 15 });
      const res = mockResponse();

      const middleware = validate(schema, 'body');
      await middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          errors: expect.any(Array),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should validate query parameters', async () => {
      const schema = z.object({
        page: z.coerce.number().positive(),
        limit: z.coerce.number().positive(),
      });

      const req = mockRequest({ page: '1', limit: '10' }, 'query');
      const res = mockResponse();

      const middleware = validate(schema, 'query');
      await middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((req as any).query).toEqual({ page: 1, limit: 10 });
    });

    it('should validate params', async () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      const req = mockRequest(
        { id: '123e4567-e89b-12d3-a456-426614174000' },
        'params'
      );
      const res = mockResponse();

      const middleware = validate(schema, 'params');
      await middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateAll', () => {
    it('should validate multiple sources', async () => {
      const schemas = {
        params: z.object({ id: z.string() }),
        body: z.object({ name: z.string() }),
        query: z.object({ notify: z.boolean().optional() }),
      };

      const req: any = {
        params: { id: '123' },
        body: { name: 'John' },
        query: {},
      };
      const res = mockResponse();

      const middleware = validateAll(schemas);
      await middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should collect errors from multiple sources', async () => {
      const schemas = {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ email: z.string().email() }),
      };

      const req: any = {
        params: { id: 'invalid-uuid' },
        body: { email: 'invalid-email' },
      };
      const res = mockResponse();

      const middleware = validateAll(schemas);
      await middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({ source: 'params' }),
            expect.objectContaining({ source: 'body' }),
          ]),
        })
      );
    });
  });

  describe('commonSchemas', () => {
    it('should validate email', () => {
      expect(commonSchemas.email.parse('test@example.com')).toBe('test@example.com');
      expect(commonSchemas.email.parse('TEST@EXAMPLE.COM')).toBe('test@example.com');
      expect(() => commonSchemas.email.parse('invalid')).toThrow();
    });

    it('should validate password', () => {
      const validPassword = 'SecurePass123!';
      expect(() => commonSchemas.password.parse(validPassword)).not.toThrow();
      
      expect(() => commonSchemas.password.parse('short')).toThrow();
      expect(() => commonSchemas.password.parse('nouppercase123!')).toThrow();
      expect(() => commonSchemas.password.parse('NOLOWERCASE123!')).toThrow();
      expect(() => commonSchemas.password.parse('NoNumbers!')).toThrow();
      expect(() => commonSchemas.password.parse('NoSpecialChar123')).toThrow();
    });

    it('should validate objectId', () => {
      expect(() => commonSchemas.objectId.parse('507f1f77bcf86cd799439011')).not.toThrow();
      expect(() => commonSchemas.objectId.parse('invalid')).toThrow();
    });

    it('should validate uuid', () => {
      expect(() => commonSchemas.uuid.parse('123e4567-e89b-12d3-a456-426614174000')).not.toThrow();
      expect(() => commonSchemas.uuid.parse('invalid')).toThrow();
    });

    it('should validate pagination', () => {
      const result = commonSchemas.pagination.parse({});
      expect(result).toEqual({ page: 1, limit: 10 });

      const custom = commonSchemas.pagination.parse({ page: '5', limit: '20' });
      expect(custom).toEqual({ page: 5, limit: 20 });
    });
  });

  describe('createPaginationSchema', () => {
    it('should create pagination schema with custom max', () => {
      const schema = createPaginationSchema(50);
      
      expect(() => schema.parse({ limit: 30 })).not.toThrow();
      expect(() => schema.parse({ limit: 60 })).toThrow();
    });
  });
});

