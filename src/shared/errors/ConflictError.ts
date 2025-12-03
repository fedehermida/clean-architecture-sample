import { DomainError } from './DomainError';

// Error thrown when an operation conflicts with existing state
// HTTP Status: 409 Conflict
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;
  readonly conflictingField?: string;

  constructor(message: string, conflictingField?: string) {
    super(message);
    this.conflictingField = conflictingField;
  }

  static emailInUse(email: string): ConflictError {
    return new ConflictError(`Email '${email}' is already in use`, 'email');
  }

  override toJSON(): {
    code: string;
    message: string;
    statusCode: number;
    conflictingField?: string;
  } {
    return {
      ...super.toJSON(),
      ...(this.conflictingField && { conflictingField: this.conflictingField }),
    };
  }
}
