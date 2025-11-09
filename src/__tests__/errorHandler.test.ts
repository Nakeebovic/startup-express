import { AppError } from '../types';
import { StatusCodes } from 'http-status-codes';

describe('AppError', () => {
  it('should create an AppError with default status code', () => {
    const error = new AppError('Test error');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('should create an AppError with custom status code', () => {
    const error = new AppError('Not found', StatusCodes.NOT_FOUND);
    
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
  });

  it('should have a stack trace', () => {
    const error = new AppError('Test error');
    
    expect(error.stack).toBeDefined();
  });
});

