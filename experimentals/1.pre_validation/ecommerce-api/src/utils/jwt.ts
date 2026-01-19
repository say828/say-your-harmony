import jwt from 'jsonwebtoken';
import { TokenPayload, UserRole } from '../types/index.js';
import { TokenExpiredError, TokenInvalidError } from '../errors/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

export const generateAccessToken = (userId: string, email: string, role: UserRole): string => {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId,
    email,
    role,
    type: 'access',
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const generateRefreshToken = (userId: string): string => {
  const payload: Omit<TokenPayload, 'email' | 'role' | 'iat' | 'exp'> & { type: 'refresh' } = {
    userId,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });
};

export const verifyToken = (token: string, expectedType: 'access' | 'refresh'): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (decoded.type !== expectedType) {
      throw new TokenInvalidError(`Expected ${expectedType} token, got ${decoded.type}`);
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TokenInvalidError(error.message);
    }
    throw error;
  }
};
