import { Response } from 'express';
import { SuccessResponse, ErrorResponse, PaginationMeta, ValidationError } from '../types/index.js';
import { AppError } from '../errors/index.js';
import { ZodError } from 'zod';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: AppError | Error,
  path: string
): Response => {
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        path,
      },
    };
    return res.status(error.statusCode).json(response);
  }

  // Unexpected error
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      timestamp: new Date().toISOString(),
      path,
    },
  };
  return res.status(500).json(response);
};

export const formatZodError = (error: ZodError): ValidationError[] => {
  return error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
    received: err.code === 'invalid_type' ? (err as any).received : undefined,
  }));
};

export const sanitizeBody = (body: unknown): unknown => {
  if (typeof body !== 'object' || body === null) return body;

  const sanitized = { ...body } as Record<string, unknown>;
  const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'accessToken'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};
