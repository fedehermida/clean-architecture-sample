import { DomainError } from './DomainError';

// Error thrown when a requested resource is not found
// HTTP Status: 404 Not Found
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  readonly resourceType: string;
  readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(`${resourceType} with id '${resourceId}' not found`);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  static user(userId: string): NotFoundError {
    return new NotFoundError('User', userId);
  }

  static product(productId: string): NotFoundError {
    return new NotFoundError('Product', productId);
  }

  override toJSON(): {
    code: string;
    message: string;
    statusCode: number;
    resourceType: string;
    resourceId: string;
  } {
    return {
      ...super.toJSON(),
      resourceType: this.resourceType,
      resourceId: this.resourceId,
    };
  }
}
