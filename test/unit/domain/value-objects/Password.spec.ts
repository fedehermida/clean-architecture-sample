import { describe, it, expect } from 'vitest';
import { Password } from '@domain/value-objects/Password';

describe('Password Value Object', () => {
  const mockHasher = (password: string) => `hashed_${password}`;
  const mockAsyncHasher = async (password: string) => `hashed_${password}`;

  describe('validateAndHash', () => {
    it('creates password from valid plaintext', () => {
      const result = Password.validateAndHash('validpassword123', mockHasher);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('hashed_validpassword123');
      }
    });

    it('fails for empty password', () => {
      const result = Password.validateAndHash('', mockHasher);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
        expect(result.error.fields[0]?.code).toBe('REQUIRED');
      }
    });

    it('fails for password shorter than 8 characters', () => {
      const result = Password.validateAndHash('short', mockHasher);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('TOO_SHORT');
        expect(result.error.fields[0]?.constraints?.['minLength']).toBe(8);
      }
    });

    it('fails for password longer than 128 characters', () => {
      const longPassword = 'a'.repeat(129);
      const result = Password.validateAndHash(longPassword, mockHasher);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('TOO_LONG');
        expect(result.error.fields[0]?.constraints?.['maxLength']).toBe(128);
      }
    });

    it('accepts password with exactly 8 characters', () => {
      const result = Password.validateAndHash('12345678', mockHasher);

      expect(result.ok).toBe(true);
    });

    it('accepts password with exactly 128 characters', () => {
      const maxPassword = 'a'.repeat(128);
      const result = Password.validateAndHash(maxPassword, mockHasher);

      expect(result.ok).toBe(true);
    });
  });

  describe('validateAndHashAsync', () => {
    it('creates password from valid plaintext asynchronously', async () => {
      const result = await Password.validateAndHashAsync('validpassword123', mockAsyncHasher);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('hashed_validpassword123');
      }
    });

    it('fails for invalid password asynchronously', async () => {
      const result = await Password.validateAndHashAsync('short', mockAsyncHasher);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('TOO_SHORT');
      }
    });
  });

  describe('fromHash', () => {
    it('creates password from existing hash', () => {
      const password = Password.fromHash('existing_hash_value');

      expect(password.value).toBe('existing_hash_value');
    });
  });

  describe('equality', () => {
    it('considers passwords with same hash equal', () => {
      const password1 = Password.fromHash('same_hash');
      const password2 = Password.fromHash('same_hash');

      expect(password1.equals(password2)).toBe(true);
    });

    it('considers passwords with different hashes not equal', () => {
      const password1 = Password.fromHash('hash1');
      const password2 = Password.fromHash('hash2');

      expect(password1.equals(password2)).toBe(false);
    });
  });
});
