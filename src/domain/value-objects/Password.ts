import { Result, ok, err } from '@shared/Result';
import { ValidationError, FieldError } from '@shared/errors';

// Value Object: Password
// Handles password validation rules and hashing
// Note: This wraps a hash, not plaintext password
export class Password {
  private readonly hash: string;

  private constructor(hash: string) {
    this.hash = hash;
  }

  // Create from hashed value (when loading from database)
  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  // Validate plaintext password against rules and return hash
  static validateAndHash(
    plaintext: string,
    hasher: (password: string) => string,
  ): Result<Password, ValidationError> {
    const validationResult = Password.validateRules(plaintext);

    if (!validationResult.ok) {
      return validationResult;
    }

    const hash = hasher(plaintext);
    return ok(new Password(hash));
  }

  // Async version for async hashers
  static async validateAndHashAsync(
    plaintext: string,
    hasher: (password: string) => Promise<string>,
  ): Promise<Result<Password, ValidationError>> {
    const validationResult = Password.validateRules(plaintext);

    if (!validationResult.ok) {
      return validationResult;
    }

    const hash = await hasher(plaintext);
    return ok(new Password(hash));
  }

  private static validateRules(plaintext: string): Result<void, ValidationError> {
    const errors: FieldError[] = [];

    if (!plaintext) {
      errors.push({ field: 'password', code: 'REQUIRED', message: 'Password is required' });
    } else {
      if (plaintext.length < 8) {
        errors.push({
          field: 'password',
          code: 'TOO_SHORT',
          message: 'Password must be at least 8 characters',
          constraints: { minLength: 8 },
        });
      }

      if (plaintext.length > 128) {
        errors.push({
          field: 'password',
          code: 'TOO_LONG',
          message: 'Password must be at most 128 characters',
          constraints: { maxLength: 128 },
        });
      }
    }

    if (errors.length > 0) {
      return err(ValidationError.fromFieldErrors(errors));
    }

    return ok(undefined);
  }

  get value(): string {
    return this.hash;
  }

  equals(other: Password): boolean {
    return this.hash === other.hash;
  }
}
