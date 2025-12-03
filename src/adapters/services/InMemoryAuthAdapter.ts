import { randomUUID, createHash } from 'node:crypto';
import {
  AuthenticationService,
  AuthToken,
  AuthUser,
} from '@application/services/AuthenticationService';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
}

interface StoredToken {
  userId: string;
  expiresAt: Date;
}

// Adapter: In-Memory Authentication implementation
// Useful for testing and development without external dependencies
export class InMemoryAuthAdapter implements AuthenticationService {
  private users = new Map<string, StoredUser>();
  private usersByEmail = new Map<string, StoredUser>();
  private tokens = new Map<string, StoredToken>();

  // Simple hash for demo purposes (same approach as FastPasswordHasher)
  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  async authenticate(email: string, password: string): Promise<AuthToken | null> {
    const user = this.usersByEmail.get(email);
    if (!user) {
      return null;
    }

    const passwordHash = this.hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return null;
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    this.tokens.set(token, {
      userId: user.id,
      expiresAt,
    });

    return { token, expiresAt };
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    const storedToken = this.tokens.get(token);
    if (!storedToken) {
      return null;
    }

    if (new Date() > storedToken.expiresAt) {
      this.tokens.delete(token);
      return null;
    }

    const user = this.users.get(storedToken.userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async revokeToken(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  async createUser(email: string, password: string): Promise<string> {
    if (this.usersByEmail.has(email)) {
      throw new Error('User already exists');
    }

    const id = randomUUID();
    const passwordHash = this.hashPassword(password);

    const user: StoredUser = { id, email, passwordHash };
    this.users.set(id, user);
    this.usersByEmail.set(email, user);

    return id;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.usersByEmail.delete(user.email);

      // Also revoke all tokens for this user
      for (const [token, storedToken] of this.tokens) {
        if (storedToken.userId === userId) {
          this.tokens.delete(token);
        }
      }
    }
  }

  // Helper method for testing: clear all data
  clear(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.tokens.clear();
  }
}
