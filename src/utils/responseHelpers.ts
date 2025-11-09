import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse, PaginationMeta } from '../types';

/**
 * Send a success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = StatusCodes.OK,
  req?: Request
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req?.requestId,
    },
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  req?: Request
): Response => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  const paginationMeta: PaginationMeta = {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages,
    hasNext: pagination.page < totalPages,
    hasPrev: pagination.page > 1,
  };

  const response: SuccessResponse<T[]> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req?.requestId,
      pagination: paginationMeta,
    },
  };

  return res.status(StatusCodes.OK).json(response);
};

/**
 * Send a created response
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully',
  req?: Request
): Response => {
  return sendSuccess(res, data, message, StatusCodes.CREATED, req);
};

/**
 * Send a no content response
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(StatusCodes.NO_CONTENT).send();
};

/**
 * Send an accepted response (for async operations)
 */
export const sendAccepted = <T>(
  res: Response,
  data: T,
  message: string = 'Request accepted for processing',
  req?: Request
): Response => {
  return sendSuccess(res, data, message, StatusCodes.ACCEPTED, req);
};

/**
 * Helper to calculate pagination offset
 */
export const getPaginationOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Helper to create pagination metadata
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
