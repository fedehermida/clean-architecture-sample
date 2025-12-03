import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { GetUserByEmail } from '@application/use-cases/GetUserByEmail';
import { User } from '@domain/entities/User';

describe('GetUserByEmail Use Case', () => {
  let repo: InMemoryUserRepository;
  let usecase: GetUserByEmail;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    usecase = new GetUserByEmail(repo);
  });

  describe('successful retrieval', () => {
    it('returns user data when user exists', async () => {
      const user = User.create({
        id: 'user-789',
        email: 'findme@example.com',
        passwordHash: 'hashedpassword',
      });
      await repo.save(user);

      const result = await usecase.execute({ email: 'findme@example.com' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('user-789');
        expect(result.value.email).toBe('findme@example.com');
        expect(result.value.createdAt).toBeInstanceOf(Date);
      }
    });

    it('is case-sensitive for email lookup', async () => {
      const user = User.create({
        id: 'user-case',
        email: 'CaseSensitive@example.com',
        passwordHash: 'hashedpassword',
      });
      await repo.save(user);

      // Exact match works
      const exactResult = await usecase.execute({ email: 'CaseSensitive@example.com' });
      expect(exactResult.ok).toBe(true);

      // Different case fails (repository is case-sensitive)
      const differentCaseResult = await usecase.execute({ email: 'casesensitive@example.com' });
      expect(differentCaseResult.ok).toBe(false);
    });
  });

  describe('user not found', () => {
    it('returns error when user does not exist', async () => {
      const result = await usecase.execute({ email: 'notfound@example.com' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('User not found');
      }
    });
  });
});
