import { Result, ok, err } from '@shared/Result';
import { ValidationError } from '@shared/errors';

// Value Object: Email
// Encapsulates email validation and normalization
// Immutable - all operations return new instances
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email.toLowerCase().trim();
  }

  static create(email: string): Result<Email, ValidationError> {
    const trimmed = email.toLowerCase().trim();

    if (!trimmed) {
      return err(ValidationError.singleField('email', 'REQUIRED', 'Email is required'));
    }

    if (!Email.isValidFormat(trimmed)) {
      return err(ValidationError.singleField('email', 'INVALID_FORMAT', 'Invalid email format'));
    }

    return ok(new Email(trimmed));
  }

  private static isValidFormat(email: string): boolean {
    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  get domain(): string {
    return this.value.split('@')[1]!;
  }

  get localPart(): string {
    return this.value.split('@')[0]!;
  }
}
