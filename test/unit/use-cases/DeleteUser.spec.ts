import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { DeleteUser } from '@application/use-cases/DeleteUser';
import { User } from '@domain/entities/User';

describe('DeleteUser Use Case', () => {
  let repo: InMemoryUserRepository;
  let usecase: DeleteUser;

  // Valid UUIDs for testing
  const userToDeleteId = '550e8400-e29b-41d4-a716-446655440010';
  const userGoneId = '550e8400-e29b-41d4-a716-446655440011';
  const deleteTwiceId = '550e8400-e29b-41d4-a716-446655440012';
  const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    usecase = new DeleteUser(repo);
  });

  describe('successful deletion', () => {
    it('deletes an existing user', async () => {
      const user = User.create({
        id: userToDeleteId,
        email: 'delete@example.com',
        passwordHash: 'hashedpassword',
      });
      await repo.save(user);

      const result = await usecase.execute({ userId: userToDeleteId });

      expect(result.ok).toBe(true);
    });

    it('user is no longer findable after deletion', async () => {
      const user = User.create({
        id: userGoneId,
        email: 'gone@example.com',
        passwordHash: 'hashedpassword',
      });
      await repo.save(user);

      await usecase.execute({ userId: userGoneId });

      const findById = await repo.findById(userGoneId);
      const findByEmail = await repo.findByEmail('gone@example.com');

      expect(findById).toBeNull();
      expect(findByEmail).toBeNull();
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

  describe('idempotency', () => {
    it('cannot delete the same user twice', async () => {
      const user = User.create({
        id: deleteTwiceId,
        email: 'twice@example.com',
        passwordHash: 'hashedpassword',
      });
      await repo.save(user);

      // First deletion succeeds
      const firstResult = await usecase.execute({ userId: deleteTwiceId });
      expect(firstResult.ok).toBe(true);

      // Second deletion fails
      const secondResult = await usecase.execute({ userId: deleteTwiceId });
      expect(secondResult.ok).toBe(false);
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
