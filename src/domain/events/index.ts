// Re-export all domain events
export { DomainEvent, BaseDomainEvent } from './DomainEvent';

// User events
export {
  UserRegisteredEvent,
  UserLoggedInEvent,
  UserDeactivatedEvent,
  UserEmailChangedEvent,
  UserDeletedEvent,
} from './UserEvents';

// Product events
export {
  ProductCreatedEvent,
  ProductStockReducedEvent,
  ProductStockIncreasedEvent,
  ProductOutOfStockEvent,
  ProductDeletedEvent,
} from './ProductEvents';
