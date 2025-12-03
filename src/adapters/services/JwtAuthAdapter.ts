import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { createHmac, randomUUID } from 'node:crypto';
import {
  AuthenticationService,
  AuthToken,
  AuthUser,
} from '@application/services/AuthenticationService';
import { UserRepository } from '@domain/repositories/UserRepository';
import { PasswordHasher } from '@application/services/PasswordHasher';
import { TYPES } from '@infrastructure/di/types';

interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number; // issued at
  exp: number; // expiration
}

// Adapter: Simple JWT Authentication implementation
// Uses the existing UserRepository and PasswordHasher for user management
// Demonstrates how auth can integrate with domain repositories
@injectable()
export class JwtAuthAdapter implements AuthenticationService {
  private readonly secret: string;
  private readonly expiresInMs = 60 * 60 * 1000; // 1 hour
  private revokedTokens = new Set<string>();

  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.PasswordHasher) private readonly passwordHasher: PasswordHasher,
  ) {
    // In production, this should come from environment variables
    this.secret = process.env['JWT_SECRET'] ?? 'clean-architecture-demo-secret';
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString();
  }

  private sign(payload: JwtPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.base64UrlEncode(JSON.stringify(payload));

    const signature = createHmac('sha256', this.secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  private verify(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const headerB64 = parts[0]!;
      const payloadB64 = parts[1]!;
      const signature = parts[2]!;

      // Verify signature
      const expectedSignature = createHmac('sha256', this.secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      if (signature !== expectedSignature) {
        return null;
      }

      const payload: JwtPayload = JSON.parse(this.base64UrlDecode(payloadB64));

      // Check expiration
      if (Date.now() > payload.exp) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  async authenticate(email: string, password: string): Promise<AuthToken | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    // Verify password
    const passwordHash = await this.passwordHasher.hash(password);
    if (user.passwordHash !== passwordHash) {
      return null;
    }

    const now = Date.now();
    const expiresAt = new Date(now + this.expiresInMs);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      iat: now,
      exp: expiresAt.getTime(),
    };

    const token = this.sign(payload);

    return { token, expiresAt };
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    if (this.revokedTokens.has(token)) {
      return null;
    }

    const payload = this.verify(token);
    if (!payload) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  }

  async revokeToken(token: string): Promise<void> {
    this.revokedTokens.add(token);
  }

  async createUser(email: string, password: string): Promise<string> {
    // This adapter delegates user creation to the repository
    // The user should be created via RegisterUser use case
    // This method just returns a new UUID for consistency
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }
    return randomUUID();
  }

  async deleteUser(userId: string): Promise<void> {
    // Delegate to repository
    await this.userRepository.deleteById(userId);
  }
}
