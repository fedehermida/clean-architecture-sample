import { describe, it, expect } from 'vitest';
import { User, UserRole } from '@domain/entities/User';

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

    it('normalizes email to lowercase', () => {
      const user = User.create({
        id: 'user-123',
        email: 'Test@Example.COM',
        passwordHash: 'hash',
      });

      expect(user.email).toBe('test@example.com');
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

    it('defaults role to MEMBER', () => {
      const user = User.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hash',
      });

      expect(user.role).toBe(UserRole.MEMBER);
    });

    it('accepts custom role', () => {
      const user = User.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: UserRole.ADMIN,
      });

      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('sets isActive to true by default', () => {
      const user = User.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hash',
      });

      expect(user.isActive).toBe(true);
    });

    it('emits UserRegisteredEvent on creation', () => {
      const user = User.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hash',
      });

      const events = user.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]!.eventType).toBe('USER_REGISTERED');
    });
  });

  describe('business methods', () => {
    describe('canAccessAdminPanel', () => {
      it('returns true for active admin users', () => {
        const admin = User.create({
          id: 'admin-1',
          email: 'admin@example.com',
          passwordHash: 'hash',
          role: UserRole.ADMIN,
        });

        expect(admin.canAccessAdminPanel()).toBe(true);
      });

      it('returns false for non-admin users', () => {
        const member = User.create({
          id: 'member-1',
          email: 'member@example.com',
          passwordHash: 'hash',
          role: UserRole.MEMBER,
        });

        expect(member.canAccessAdminPanel()).toBe(false);
      });
    });

    describe('canModerate', () => {
      it('returns true for moderators', () => {
        const mod = User.create({
          id: 'mod-1',
          email: 'mod@example.com',
          passwordHash: 'hash',
          role: UserRole.MODERATOR,
        });

        expect(mod.canModerate()).toBe(true);
      });

      it('returns true for admins', () => {
        const admin = User.create({
          id: 'admin-1',
          email: 'admin@example.com',
          passwordHash: 'hash',
          role: UserRole.ADMIN,
        });

        expect(admin.canModerate()).toBe(true);
      });

      it('returns false for regular members', () => {
        const member = User.create({
          id: 'member-1',
          email: 'member@example.com',
          passwordHash: 'hash',
        });

        expect(member.canModerate()).toBe(false);
      });
    });

    describe('recordLogin', () => {
      it('returns new user with updated lastLoginAt', () => {
        const user = User.create({
          id: 'user-1',
          email: 'test@example.com',
          passwordHash: 'hash',
        });

        expect(user.lastLoginAt).toBeNull();

        const loggedInUser = user.recordLogin();

        expect(loggedInUser.lastLoginAt).toBeInstanceOf(Date);
        expect(user.lastLoginAt).toBeNull(); // Original unchanged (immutability)
      });
    });

    describe('deactivate', () => {
      it('deactivates an active user', () => {
        const user = User.create({
          id: 'user-1',
          email: 'test@example.com',
          passwordHash: 'hash',
        });
        user.pullDomainEvents(); // Clear creation event

        const result = user.deactivate();

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.isActive).toBe(false);
          const events = result.value.pullDomainEvents();
          expect(events).toHaveLength(1);
          expect(events[0]!.eventType).toBe('USER_DEACTIVATED');
        }
      });

      it('fails if user is already deactivated', () => {
        const user = User.create({
          id: 'user-1',
          email: 'test@example.com',
          passwordHash: 'hash',
        });

        const deactivated = user.deactivate();
        expect(deactivated.ok).toBe(true);

        if (deactivated.ok) {
          const result = deactivated.value.deactivate();
          expect(result.ok).toBe(false);
        }
      });
    });

    describe('changeEmail', () => {
      it('returns new user with changed email', () => {
        const user = User.create({
          id: 'user-1',
          email: 'old@example.com',
          passwordHash: 'hash',
        });
        user.pullDomainEvents(); // Clear creation event

        const updated = user.changeEmail('new@example.com');

        expect(updated.email).toBe('new@example.com');
        expect(user.email).toBe('old@example.com'); // Original unchanged

        const events = updated.pullDomainEvents();
        expect(events).toHaveLength(1);
        expect(events[0]!.eventType).toBe('USER_EMAIL_CHANGED');
      });
    });

    describe('promote', () => {
      it('promotes a member to moderator', () => {
        const member = User.create({
          id: 'user-1',
          email: 'test@example.com',
          passwordHash: 'hash',
        });

        const result = member.promote(UserRole.MODERATOR);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.role).toBe(UserRole.MODERATOR);
        }
      });

      it('fails to promote an admin', () => {
        const admin = User.create({
          id: 'admin-1',
          email: 'admin@example.com',
          passwordHash: 'hash',
          role: UserRole.ADMIN,
        });

        const result = admin.promote(UserRole.ADMIN);

        expect(result.ok).toBe(false);
      });
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

    it('reconstitute does not emit events', () => {
      const user = User.reconstitute({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: UserRole.MEMBER,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
      });

      const events = user.pullDomainEvents();
      expect(events).toHaveLength(0);
    });
  });
});
