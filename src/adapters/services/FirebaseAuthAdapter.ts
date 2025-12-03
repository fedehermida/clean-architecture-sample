import 'reflect-metadata';
import { injectable } from 'inversify';
import { admin } from '@infrastructure/database/firestore/connection';
import {
  AuthenticationService,
  AuthToken,
  AuthUser,
} from '@application/services/AuthenticationService';

// Adapter: Firebase Authentication implementation
// Uses Firebase Admin SDK to manage authentication
@injectable()
export class FirebaseAuthAdapter implements AuthenticationService {
  private auth = admin.auth();

  async authenticate(email: string, password: string): Promise<AuthToken | null> {
    try {
      // Firebase Admin SDK doesn't support password verification directly
      // In a real scenario, you would use Firebase Client SDK on frontend
      // or use Firebase REST API for password verification
      // For this demo, we verify the user exists and create a custom token
      const user = await this.auth.getUserByEmail(email);

      // Create a custom token (valid for 1 hour by default)
      const token = await this.auth.createCustomToken(user.uid);

      return {
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      };
    } catch {
      return null;
    }
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      // For custom tokens, we need to verify differently
      // In production, you'd verify ID tokens from the client
      const decoded = await this.auth.verifyIdToken(token);

      return {
        id: decoded.uid,
        email: decoded.email ?? '',
      };
    } catch {
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = await this.auth.verifyIdToken(token);
      await this.auth.revokeRefreshTokens(decoded.uid);
    } catch {
      // Token might already be invalid, ignore
    }
  }

  async createUser(email: string, password: string): Promise<string> {
    const userRecord = await this.auth.createUser({
      email,
      password,
      emailVerified: false,
    });
    return userRecord.uid;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.auth.deleteUser(userId);
  }
}
