// Re-export all error types for convenient importing
export { DomainError } from './DomainError';
export { ValidationError, type FieldError } from './ValidationError';
export { NotFoundError } from './NotFoundError';
export { ConflictError } from './ConflictError';
export { UnauthorizedError } from './UnauthorizedError';
export { InvalidOperationError } from './InvalidOperationError';

// Type guard to check if an error is a DomainError
import { DomainError } from './DomainError';

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
