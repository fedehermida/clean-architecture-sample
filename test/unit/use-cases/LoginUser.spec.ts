import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAuthAdapter } from '@adapters/services/InMemoryAuthAdapter';
import { LoginUser } from '@application/use-cases/LoginUser';

describe('LoginUser Use Case', () => {
  let authAdapter: InMemoryAuthAdapter;
  let usecase: LoginUser;

  beforeEach(async () => {
    authAdapter = new InMemoryAuthAdapter();
    usecase = new LoginUser(authAdapter);

    // Create a test user
    await authAdapter.createUser('test@example.com', 'password123');
  });

  describe('successful login', () => {
    it('returns a token for valid credentials', async () => {
      const result = await usecase.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.token).toBeTypeOf('string');
        expect(result.value.expiresAt).toBeInstanceOf(Date);
      }
    });

    it('returns a token that expires in the future', async () => {
      const result = await usecase.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.expiresAt.getTime()).toBeGreaterThan(Date.now());
      }
    });
  });

  describe('failed login', () => {
    it('returns error for non-existent user', async () => {
      const result = await usecase.execute({
        email: 'notfound@example.com',
        password: 'password123',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Invalid email or password');
      }
    });

    it('returns error for wrong password', async () => {
      const result = await usecase.execute({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Invalid email or password');
      }
    });
  });

  describe('validation errors', () => {
    it('rejects invalid email format', async () => {
      const result = await usecase.execute({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('email');
      }
    });

    it('rejects empty password', async () => {
      const result = await usecase.execute({
        email: 'test@example.com',
        password: '',
      });

      expect(result.ok).toBe(false);
    });
  });
});
