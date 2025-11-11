import { describe, it, expect } from 'vitest';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { FastPasswordHasher } from '@adapters/services/FastPasswordHasher';
import { RegisterUser } from '@application/use-cases/RegisterUser';

describe('RegisterUser', () => {
  it('registers a new user', async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new FastPasswordHasher();
    const usecase = new RegisterUser(repo, hasher);

    const result = await usecase.execute({ email: 'a@b.com', password: 'password123' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.userId).toBeTypeOf('string');
    }
  });

  it('prevents duplicate emails', async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new FastPasswordHasher();
    const usecase = new RegisterUser(repo, hasher);

    await usecase.execute({ email: 'dup@b.com', password: 'password123' });
    const result = await usecase.execute({ email: 'dup@b.com', password: 'password123' });

    expect(result.ok).toBe(false);
  });
});


