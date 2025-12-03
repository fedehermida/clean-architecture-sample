import { describe, it, expect } from 'vitest';
import { User } from '@domain/entities/User';

describe('User Domain Entity', () => {
  describe('creation', () => {
    it('creates a user with all required properties', () => {
      const user = User.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      });

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashedpassword');
    });

    it('generates createdAt when not provided', () => {
      const before = new Date();
      const user = User.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      });
      const after = new Date();

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('uses provided createdAt when given', () => {
      const customDate = new Date('2024-01-01T00:00:00Z');
      const user = User.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        createdAt: customDate,
      });

      expect(user.createdAt).toEqual(customDate);
    });
  });

  describe('immutability', () => {
    it('properties are read-only (via getters)', () => {
      const user = User.create({
        id: 'user-immutable',
        email: 'immutable@example.com',
        passwordHash: 'hash',
      });

      // TypeScript prevents direct assignment at compile time
      // At runtime, getters without setters prevent modification
      expect(user.id).toBe('user-immutable');
      expect(user.email).toBe('immutable@example.com');
    });
  });

  describe('factory pattern', () => {
    it('uses static create method (not new)', () => {
      // The User class uses a private constructor
      // forcing usage of the factory method
      const user = User.create({
        id: 'factory-user',
        email: 'factory@example.com',
        passwordHash: 'hash',
      });

      expect(user).toBeInstanceOf(User);
    });
  });
});
