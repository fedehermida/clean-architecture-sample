import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { GetUserById } from '@application/use-cases/GetUserById';
import { User } from '@domain/entities/User';

describe('GetUserById Use Case', () => {
  let repo: InMemoryUserRepository;
  let usecase: GetUserById;

  // Valid UUIDs for testing
  const userId1 = '550e8400-e29b-41d4-a716-446655440001';
  const userId2 = '550e8400-e29b-41d4-a716-446655440002';
  const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    usecase = new GetUserById(repo);
  });

  describe('successful retrieval', () => {
    it('returns user data when user exists', async () => {
      const user = User.create({
        id: userId1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      });
      await repo.save(user);

      const result = await usecase.execute({ userId: userId1 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(userId1);
        expect(result.value.email).toBe('test@example.com');
        expect(result.value.createdAt).toBeInstanceOf(Date);
      }
    });

    it('does not expose password hash', async () => {
      const user = User.create({
        id: userId2,
        email: 'secure@example.com',
        passwordHash: 'supersecret',
      });
      await repo.save(user);

      const result = await usecase.execute({ userId: userId2 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).not.toHaveProperty('passwordHash');
      }
    });
  });

  describe('user not found', () => {
    it('returns error when user does not exist', async () => {
      const result = await usecase.execute({ userId: nonExistentId });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('User not found');
      }
    });
  });

  describe('validation', () => {
    it('returns error for invalid UUID format', async () => {
      const result = await usecase.execute({ userId: 'invalid-id' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Invalid user ID format');
      }
    });
  });
});
