import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { FastPasswordHasher } from '@adapters/services/FastPasswordHasher';
import { RegisterUser } from '@application/use-cases/RegisterUser';

describe('RegisterUser Use Case', () => {
  let repo: InMemoryUserRepository;
  let hasher: FastPasswordHasher;
  let usecase: RegisterUser;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    hasher = new FastPasswordHasher();
    usecase = new RegisterUser(repo, hasher);
  });

  describe('successful registration', () => {
    it('registers a new user with valid email and password', async () => {
      const result = await usecase.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.userId).toBeTypeOf('string');
        expect(result.value.userId).toHaveLength(36); // UUID format
      }
    });

    it('stores the user in the repository', async () => {
      const result = await usecase.execute({
        email: 'stored@example.com',
        password: 'password123',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        const storedUser = await repo.findById(result.value.userId);
        expect(storedUser).not.toBeNull();
        expect(storedUser?.email).toBe('stored@example.com');
      }
    });

    it('hashes the password before storing', async () => {
      const result = await usecase.execute({
        email: 'hashed@example.com',
        password: 'mypassword',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        const storedUser = await repo.findById(result.value.userId);
        expect(storedUser?.passwordHash).not.toBe('mypassword');
        expect(storedUser?.passwordHash).toHaveLength(64); // SHA256 hex length
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

    it('rejects password shorter than 8 characters', async () => {
      const result = await usecase.execute({
        email: 'test@example.com',
        password: 'short',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('8');
      }
    });

    it('rejects empty email', async () => {
      const result = await usecase.execute({
        email: '',
        password: 'password123',
      });

      expect(result.ok).toBe(false);
    });
  });

  describe('duplicate prevention', () => {
    it('prevents registering with duplicate email', async () => {
      await usecase.execute({ email: 'dup@example.com', password: 'password123' });
      const result = await usecase.execute({ email: 'dup@example.com', password: 'password123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Email already in use');
      }
    });

    it('allows different emails', async () => {
      await usecase.execute({ email: 'user1@example.com', password: 'password123' });
      const result = await usecase.execute({ email: 'user2@example.com', password: 'password123' });

      expect(result.ok).toBe(true);
    });
  });
});
