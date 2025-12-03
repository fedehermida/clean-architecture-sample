import { Result, ok, err } from '@shared/Result';
import { ValidationError } from '@shared/errors';

// Value Object: Money
// Handles monetary values with currency
// Immutable - all operations return new instances
export class Money {
  private readonly amount: number;
  private readonly currencyCode: string;

  private constructor(amount: number, currencyCode: string = 'USD') {
    // Store as cents/smallest unit to avoid floating point issues
    this.amount = Math.round(amount * 100) / 100;
    this.currencyCode = currencyCode.toUpperCase();
  }

  static create(amount: number, currencyCode: string = 'USD'): Result<Money, ValidationError> {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return err(ValidationError.singleField('price', 'INVALID_TYPE', 'Price must be a number'));
    }

    if (amount < 0) {
      return err(
        ValidationError.singleField('price', 'NEGATIVE', 'Price cannot be negative'),
      );
    }

    if (!Money.isValidCurrency(currencyCode)) {
      return err(
        ValidationError.singleField('currency', 'INVALID', `Invalid currency code: ${currencyCode}`),
      );
    }

    return ok(new Money(amount, currencyCode));
  }

  static zero(currencyCode: string = 'USD'): Money {
    return new Money(0, currencyCode);
  }

  private static isValidCurrency(code: string): boolean {
    // Common currency codes - extend as needed
    const validCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN', 'BRL'];
    return validCodes.includes(code.toUpperCase());
  }

  get value(): number {
    return this.amount;
  }

  get currency(): string {
    return this.currencyCode;
  }

  add(other: Money): Result<Money, ValidationError> {
    if (this.currencyCode !== other.currencyCode) {
      return err(
        ValidationError.singleField(
          'currency',
          'MISMATCH',
          `Cannot add ${this.currencyCode} and ${other.currencyCode}`,
        ),
      );
    }
    return ok(new Money(this.amount + other.amount, this.currencyCode));
  }

  subtract(other: Money): Result<Money, ValidationError> {
    if (this.currencyCode !== other.currencyCode) {
      return err(
        ValidationError.singleField(
          'currency',
          'MISMATCH',
          `Cannot subtract ${other.currencyCode} from ${this.currencyCode}`,
        ),
      );
    }

    const result = this.amount - other.amount;
    if (result < 0) {
      return err(
        ValidationError.singleField('price', 'NEGATIVE_RESULT', 'Subtraction would result in negative value'),
      );
    }

    return ok(new Money(result, this.currencyCode));
  }

  multiply(factor: number): Result<Money, ValidationError> {
    if (factor < 0) {
      return err(
        ValidationError.singleField('factor', 'NEGATIVE', 'Cannot multiply by negative factor'),
      );
    }
    return ok(new Money(this.amount * factor, this.currencyCode));
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currencyCode === other.currencyCode;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isGreaterThan(other: Money): boolean {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error('Cannot compare different currencies');
    }
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error('Cannot compare different currencies');
    }
    return this.amount < other.amount;
  }

  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currencyCode,
    }).format(this.amount);
  }

  toString(): string {
    return `${this.currencyCode} ${this.amount.toFixed(2)}`;
  }
}
