import { createHmac, randomUUID } from 'node:crypto';
import {
  AuthenticationService,
  AuthToken,
  AuthUser,
} from '@application/services/AuthenticationService';

interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number; // issued at
  exp: number; // expiration
}

// Adapter: Simple JWT Authentication implementation
// Self-contained JWT implementation without external dependencies
export class JwtAuthAdapter implements AuthenticationService {
  private readonly secret: string;
  private readonly expiresInMs = 60 * 60 * 1000; // 1 hour
  private revokedTokens = new Set<string>();
  // In-memory user storage for demo (production would use a database)
  private users = new Map<string, { id: string; email: string; passwordHash: string }>();
  private usersByEmail = new Map<string, { id: string; email: string; passwordHash: string }>();

  constructor() {
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

  // Simple hash for demo purposes
  private hashPassword(password: string): string {
    return createHmac('sha256', this.secret).update(password).digest('hex');
  }

  async authenticate(email: string, password: string): Promise<AuthToken | null> {
    const user = this.usersByEmail.get(email);
    if (!user) {
      return null;
    }

    // Verify password
    const passwordHash = this.hashPassword(password);
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
    if (this.usersByEmail.has(email)) {
      throw new Error('User already exists');
    }

    const id = randomUUID();
    const passwordHash = this.hashPassword(password);
    const user = { id, email, passwordHash };

    this.users.set(id, user);
    this.usersByEmail.set(email, user);

    return id;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.usersByEmail.delete(user.email);
      // Revoke all tokens for this user by clearing revoked set and adding them back
      // In production, you'd track tokens per user
    }
  }

  // Helper method for testing: clear all data
  clear(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.revokedTokens.clear();
  }
}
