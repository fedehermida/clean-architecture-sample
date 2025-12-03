// Base interface for all domain events
// Domain events represent something that happened in the domain

export interface DomainEvent {
  readonly eventType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly payload: Record<string, unknown>;
}

// Base class for domain events with common functionality
export abstract class BaseDomainEvent implements DomainEvent {
  abstract readonly eventType: string;
  abstract readonly payload: Record<string, unknown>;

  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      occurredAt: this.occurredAt.toISOString(),
      payload: this.payload,
    };
  }
}
