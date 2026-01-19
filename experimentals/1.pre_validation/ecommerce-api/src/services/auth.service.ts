import { IStorage } from '../storage/interface.js';
import {
  UserCreateInput,
  UserLoginInput,
  UserPublic,
  AuthTokens,
  RefreshTokenInput,
} from '../types/index.js';
import {
  AlreadyExistsError,
  InvalidCredentialsError,
  UnauthorizedError,
  NotFoundError,
} from '../errors/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';

export class AuthService {
  constructor(private storage: IStorage) {}

  async register(input: UserCreateInput): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await this.storage.users.findByEmail(input.email);
    if (existingUser) {
      throw new AlreadyExistsError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await this.storage.users.create({
      ...input,
      passwordHash,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
    };
  }

  async login(input: UserLoginInput): Promise<AuthTokens> {
    // Find user by email
    const user = await this.storage.users.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
    };
  }

  async refresh(input: RefreshTokenInput): Promise<{ accessToken: string }> {
    // Verify refresh token
    const payload = verifyToken(input.refreshToken, 'refresh');

    // Check if token is blacklisted
    const isBlacklisted = await this.storage.tokens.isBlacklisted(input.refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    // Get user
    const user = await this.storage.users.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id, user.email, user.role);

    return { accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    // Verify token
    verifyToken(refreshToken, 'refresh');

    // Add to blacklist
    await this.storage.tokens.addToBlacklist(refreshToken);
  }

  async getMe(userId: string): Promise<UserPublic> {
    const user = await this.storage.users.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.toPublicUser(user);
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    firstName: string;
    lastName: string;
    createdAt: string;
  }): UserPublic {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }
}
