export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid email or password') {
    super(401, 'INVALID_CREDENTIALS', message);
    this.name = 'InvalidCredentialsError';
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = 'Token has expired') {
    super(401, 'TOKEN_EXPIRED', message);
    this.name = 'TokenExpiredError';
  }
}

export class TokenInvalidError extends AppError {
  constructor(message = 'Invalid token') {
    super(401, 'TOKEN_INVALID', message);
    this.name = 'TokenInvalidError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class AlreadyExistsError extends AppError {
  constructor(message: string) {
    super(409, 'ALREADY_EXISTS', message);
    this.name = 'AlreadyExistsError';
  }
}

export class InsufficientStockError extends AppError {
  constructor(productName: string, available: number, requested: number) {
    super(409, 'INSUFFICIENT_STOCK', `Insufficient stock for ${productName}`);
    this.details = { available, requested };
    this.name = 'InsufficientStockError';
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      409,
      'INVALID_STATUS_TRANSITION',
      `Cannot transition from ${currentStatus} to ${targetStatus}`
    );
    this.name = 'InvalidStatusTransitionError';
  }
}

export class CartExpiredError extends AppError {
  constructor(message = 'Cart has expired') {
    super(410, 'CART_EXPIRED', message);
    this.name = 'CartExpiredError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, 'RATE_LIMITED', message);
    this.name = 'RateLimitError';
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, 'INTERNAL_ERROR', message);
    this.name = 'InternalError';
  }
}
