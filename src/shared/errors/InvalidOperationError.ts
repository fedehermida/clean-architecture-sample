import { DomainError } from './DomainError';

// Error thrown when an operation is invalid for the current state
// HTTP Status: 422 Unprocessable Entity
export class InvalidOperationError extends DomainError {
  readonly code = 'INVALID_OPERATION';
  readonly statusCode = 422;

  constructor(message: string) {
    super(message);
  }

  static insufficientStock(available: number, requested: number): InvalidOperationError {
    return new InvalidOperationError(
      `Insufficient stock: requested ${requested}, available ${available}`,
    );
  }

  static userAlreadyDeactivated(): InvalidOperationError {
    return new InvalidOperationError('User is already deactivated');
  }
}
