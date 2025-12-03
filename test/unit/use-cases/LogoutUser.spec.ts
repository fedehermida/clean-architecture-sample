import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAuthAdapter } from '@adapters/services/InMemoryAuthAdapter';
import { LogoutUser } from '@application/use-cases/LogoutUser';

describe('LogoutUser Use Case', () => {
  let authAdapter: InMemoryAuthAdapter;
  let usecase: LogoutUser;
  let validToken: string;

  beforeEach(async () => {
    authAdapter = new InMemoryAuthAdapter();
    usecase = new LogoutUser(authAdapter);

    // Create and authenticate a test user
    await authAdapter.createUser('test@example.com', 'password123');
    const authResult = await authAdapter.authenticate('test@example.com', 'password123');
    validToken = authResult!.token;
  });

  describe('successful logout', () => {
    it('revokes a valid token', async () => {
      const result = await usecase.execute({ token: validToken });

      expect(result.ok).toBe(true);
    });

    it('token is no longer valid after logout', async () => {
      await usecase.execute({ token: validToken });

      const verifyResult = await authAdapter.verifyToken(validToken);
      expect(verifyResult).toBeNull();
    });
  });

  describe('validation', () => {
    it('returns error for empty token', async () => {
      const result = await usecase.execute({ token: '' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Token is required');
      }
    });

    it('succeeds even for non-existent token (idempotent)', async () => {
      const result = await usecase.execute({ token: 'non-existent-token' });

      expect(result.ok).toBe(true);
    });
  });
});
