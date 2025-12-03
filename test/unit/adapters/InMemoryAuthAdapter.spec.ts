import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAuthAdapter } from '@adapters/services/InMemoryAuthAdapter';

describe('InMemoryAuthAdapter', () => {
  let adapter: InMemoryAuthAdapter;

  beforeEach(() => {
    adapter = new InMemoryAuthAdapter();
  });

  describe('createUser', () => {
    it('creates a new user and returns id', async () => {
      const userId = await adapter.createUser('new@example.com', 'password123');

      expect(userId).toBeTypeOf('string');
      expect(userId).toHaveLength(36); // UUID format
    });

    it('throws error for duplicate email', async () => {
      await adapter.createUser('dup@example.com', 'password123');

      await expect(adapter.createUser('dup@example.com', 'password456')).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('authenticate', () => {
    beforeEach(async () => {
      await adapter.createUser('auth@example.com', 'correctpassword');
    });

    it('returns token for valid credentials', async () => {
      const result = await adapter.authenticate('auth@example.com', 'correctpassword');

      expect(result).not.toBeNull();
      expect(result?.token).toBeTypeOf('string');
      expect(result?.expiresAt).toBeInstanceOf(Date);
    });

    it('returns null for wrong password', async () => {
      const result = await adapter.authenticate('auth@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('returns null for non-existent user', async () => {
      const result = await adapter.authenticate('notfound@example.com', 'anypassword');

      expect(result).toBeNull();
    });
  });

  describe('verifyToken', () => {
    let validToken: string;

    beforeEach(async () => {
      await adapter.createUser('verify@example.com', 'password123');
      const authResult = await adapter.authenticate('verify@example.com', 'password123');
      validToken = authResult!.token;
    });

    it('returns user for valid token', async () => {
      const result = await adapter.verifyToken(validToken);

      expect(result).not.toBeNull();
      expect(result?.email).toBe('verify@example.com');
    });

    it('returns null for invalid token', async () => {
      const result = await adapter.verifyToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('revokeToken', () => {
    it('invalidates a valid token', async () => {
      await adapter.createUser('revoke@example.com', 'password123');
      const authResult = await adapter.authenticate('revoke@example.com', 'password123');
      const token = authResult!.token;

      await adapter.revokeToken(token);

      const verifyResult = await adapter.verifyToken(token);
      expect(verifyResult).toBeNull();
    });

    it('does nothing for non-existent token', async () => {
      // Should not throw
      await adapter.revokeToken('non-existent-token');
    });
  });

  describe('deleteUser', () => {
    it('removes user and invalidates their tokens', async () => {
      const userId = await adapter.createUser('delete@example.com', 'password123');
      const authResult = await adapter.authenticate('delete@example.com', 'password123');
      const token = authResult!.token;

      await adapter.deleteUser(userId);

      // Token should be invalid
      const verifyResult = await adapter.verifyToken(token);
      expect(verifyResult).toBeNull();

      // Cannot authenticate anymore
      const authAfterDelete = await adapter.authenticate('delete@example.com', 'password123');
      expect(authAfterDelete).toBeNull();
    });
  });

  describe('clear (test helper)', () => {
    it('clears all data', async () => {
      await adapter.createUser('clear@example.com', 'password123');
      const authResult = await adapter.authenticate('clear@example.com', 'password123');

      adapter.clear();

      const verifyResult = await adapter.verifyToken(authResult!.token);
      expect(verifyResult).toBeNull();

      const authAfterClear = await adapter.authenticate('clear@example.com', 'password123');
      expect(authAfterClear).toBeNull();
    });
  });
});
