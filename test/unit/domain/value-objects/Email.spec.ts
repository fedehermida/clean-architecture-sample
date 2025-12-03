import { describe, it, expect } from 'vitest';
import { Email } from '@domain/value-objects/Email';

describe('Email Value Object', () => {
  describe('creation', () => {
    it('creates a valid email', () => {
      const result = Email.create('user@example.com');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe('user@example.com');
      }
    });

    it('normalizes email to lowercase', () => {
      const result = Email.create('User@EXAMPLE.COM');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe('user@example.com');
      }
    });

    it('trims whitespace from email', () => {
      const result = Email.create('  user@example.com  ');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe('user@example.com');
      }
    });

    it('fails for empty email', () => {
      const result = Email.create('');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
        expect(result.error.fields[0]?.code).toBe('REQUIRED');
      }
    });

    it('fails for whitespace-only email', () => {
      const result = Email.create('   ');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('REQUIRED');
      }
    });

    it('fails for invalid email format - no @', () => {
      const result = Email.create('userexample.com');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('INVALID_FORMAT');
      }
    });

    it('fails for invalid email format - no domain', () => {
      const result = Email.create('user@');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('INVALID_FORMAT');
      }
    });

    it('fails for invalid email format - no TLD', () => {
      const result = Email.create('user@example');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('INVALID_FORMAT');
      }
    });
  });

  describe('domain extraction', () => {
    it('extracts domain from email', () => {
      const result = Email.create('user@example.com');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.domain).toBe('example.com');
      }
    });

    it('extracts local part from email', () => {
      const result = Email.create('john.doe@example.com');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.localPart).toBe('john.doe');
      }
    });
  });

  describe('equality', () => {
    it('considers same emails equal', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');

      expect(email1.ok && email2.ok).toBe(true);
      if (email1.ok && email2.ok) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });

    it('considers normalized emails equal', () => {
      const email1 = Email.create('USER@EXAMPLE.COM');
      const email2 = Email.create('user@example.com');

      expect(email1.ok && email2.ok).toBe(true);
      if (email1.ok && email2.ok) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });

    it('considers different emails not equal', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');

      expect(email1.ok && email2.ok).toBe(true);
      if (email1.ok && email2.ok) {
        expect(email1.value.equals(email2.value)).toBe(false);
      }
    });
  });
});
