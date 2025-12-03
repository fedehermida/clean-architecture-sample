import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { User } from '@domain/entities/User';

describe('InMemoryUserRepository', () => {
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
  });

  describe('save', () => {
    it('saves a user', async () => {
      const user = User.create({
        id: 'save-test',
        email: 'save@example.com',
        passwordHash: 'hash',
      });

      await repo.save(user);

      const found = await repo.findById('save-test');
      expect(found).not.toBeNull();
      expect(found?.email).toBe('save@example.com');
    });

    it('overwrites existing user with same id', async () => {
      const user1 = User.create({
        id: 'overwrite-id',
        email: 'original@example.com',
        passwordHash: 'hash1',
      });

      const user2 = User.create({
        id: 'overwrite-id',
        email: 'updated@example.com',
        passwordHash: 'hash2',
      });

      await repo.save(user1);
      await repo.save(user2);

      const found = await repo.findById('overwrite-id');
      expect(found?.email).toBe('updated@example.com');
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const user = User.create({
        id: 'find-by-id',
        email: 'findme@example.com',
        passwordHash: 'hash',
      });
      await repo.save(user);

      const found = await repo.findById('find-by-id');

      expect(found).not.toBeNull();
      expect(found?.id).toBe('find-by-id');
    });

    it('returns null when not found', async () => {
      const found = await repo.findById('non-existent');

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      const user = User.create({
        id: 'find-by-email',
        email: 'email@example.com',
        passwordHash: 'hash',
      });
      await repo.save(user);

      const found = await repo.findByEmail('email@example.com');

      expect(found).not.toBeNull();
      expect(found?.email).toBe('email@example.com');
    });

    it('returns null when not found', async () => {
      const found = await repo.findByEmail('notfound@example.com');

      expect(found).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('deletes existing user', async () => {
      const user = User.create({
        id: 'delete-me',
        email: 'delete@example.com',
        passwordHash: 'hash',
      });
      await repo.save(user);

      await repo.deleteById('delete-me');

      const findById = await repo.findById('delete-me');
      const findByEmail = await repo.findByEmail('delete@example.com');

      expect(findById).toBeNull();
      expect(findByEmail).toBeNull();
    });

    it('does nothing for non-existent user', async () => {
      // Should not throw
      await repo.deleteById('non-existent');
    });
  });
});
