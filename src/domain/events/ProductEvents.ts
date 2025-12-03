import { BaseDomainEvent } from './DomainEvent';

// Event: Product was created
export class ProductCreatedEvent extends BaseDomainEvent {
  readonly eventType = 'PRODUCT_CREATED';

  constructor(
    aggregateId: string,
    readonly payload: {
      name: string;
      price: number;
      stock: number;
    },
  ) {
    super(aggregateId);
  }
}

// Event: Product stock was reduced (e.g., after a sale)
export class ProductStockReducedEvent extends BaseDomainEvent {
  readonly eventType = 'PRODUCT_STOCK_REDUCED';

  constructor(
    aggregateId: string,
    readonly payload: {
      previousStock: number;
      quantityReduced: number;
      newStock: number;
    },
  ) {
    super(aggregateId);
  }
}

// Event: Product stock was increased (e.g., restocking)
export class ProductStockIncreasedEvent extends BaseDomainEvent {
  readonly eventType = 'PRODUCT_STOCK_INCREASED';

  constructor(
    aggregateId: string,
    readonly payload: {
      previousStock: number;
      quantityAdded: number;
      newStock: number;
    },
  ) {
    super(aggregateId);
  }
}

// Event: Product went out of stock
export class ProductOutOfStockEvent extends BaseDomainEvent {
  readonly eventType = 'PRODUCT_OUT_OF_STOCK';

  constructor(
    aggregateId: string,
    readonly payload: {
      name: string;
    },
  ) {
    super(aggregateId);
  }
}

// Event: Product was deleted
export class ProductDeletedEvent extends BaseDomainEvent {
  readonly eventType = 'PRODUCT_DELETED';

  constructor(
    aggregateId: string,
    readonly payload: {
      name: string;
    },
  ) {
    super(aggregateId);
  }
}
