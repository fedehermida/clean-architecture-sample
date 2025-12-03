import { Result, ok, err } from '@shared/Result';
import { ValidationError } from '@shared/errors';
import { InvalidOperationError } from '@shared/errors';

// Value Object: Stock
// Represents product inventory quantity
// Immutable - all operations return new instances
export class Stock {
  private readonly quantity: number;

  private constructor(quantity: number) {
    this.quantity = quantity;
  }

  static create(quantity: number): Result<Stock, ValidationError> {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      return err(ValidationError.singleField('stock', 'INVALID_TYPE', 'Stock must be a number'));
    }

    if (!Number.isInteger(quantity)) {
      return err(
        ValidationError.singleField('stock', 'NOT_INTEGER', 'Stock must be a whole number'),
      );
    }

    if (quantity < 0) {
      return err(
        ValidationError.singleField('stock', 'NEGATIVE', 'Stock cannot be negative'),
      );
    }

    return ok(new Stock(quantity));
  }

  static zero(): Stock {
    return new Stock(0);
  }

  get value(): number {
    return this.quantity;
  }

  canFulfill(requestedQuantity: number): boolean {
    return this.quantity >= requestedQuantity;
  }

  isInStock(): boolean {
    return this.quantity > 0;
  }

  isEmpty(): boolean {
    return this.quantity === 0;
  }

  reduce(quantity: number): Result<Stock, InvalidOperationError> {
    if (quantity < 0) {
      return err(new InvalidOperationError('Cannot reduce stock by negative amount'));
    }

    if (!this.canFulfill(quantity)) {
      return err(InvalidOperationError.insufficientStock(this.quantity, quantity));
    }

    return ok(new Stock(this.quantity - quantity));
  }

  increase(quantity: number): Result<Stock, ValidationError> {
    if (quantity < 0) {
      return err(
        ValidationError.singleField('quantity', 'NEGATIVE', 'Cannot increase stock by negative amount'),
      );
    }

    return ok(new Stock(this.quantity + quantity));
  }

  equals(other: Stock): boolean {
    return this.quantity === other.quantity;
  }

  toString(): string {
    return `${this.quantity} units`;
  }
}
