import { DomainError } from './DomainError';

// Represents a field-level validation error
export interface FieldError {
  field: string;
  code: string;
  message: string;
  constraints?: Record<string, unknown>;
}

// Validation error with structured field-level details
// HTTP Status: 400 Bad Request
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly fields: FieldError[];

  constructor(message: string, fields: FieldError[] = []) {
    super(message);
    this.fields = fields;
  }

  static fromFieldErrors(fields: FieldError[]): ValidationError {
    const message =
      fields.length === 1
        ? fields[0]!.message
        : `Validation failed: ${fields.map((f) => f.message).join(', ')}`;
    return new ValidationError(message, fields);
  }

  static singleField(field: string, code: string, message: string): ValidationError {
    return new ValidationError(message, [{ field, code, message }]);
  }

  override toJSON(): {
    code: string;
    message: string;
    statusCode: number;
    fields: FieldError[];
  } {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}
