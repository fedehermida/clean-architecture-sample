import { DomainError } from './DomainError';

// Error thrown when authentication fails or token is invalid
// HTTP Status: 401 Unauthorized
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;

  constructor(message: string = 'Authentication required') {
    super(message);
  }

  static invalidCredentials(): UnauthorizedError {
    return new UnauthorizedError('Invalid email or password');
  }

  static invalidToken(): UnauthorizedError {
    return new UnauthorizedError('Invalid or expired token');
  }

  static noToken(): UnauthorizedError {
    return new UnauthorizedError('No authentication token provided');
  }
}
