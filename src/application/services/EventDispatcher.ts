import { DomainEvent } from '@domain/events';

// Interface for dispatching domain events
// Implementations can be synchronous, async, use message queues, etc.
export interface EventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
  dispatchAll(events: DomainEvent[]): Promise<void>;
}

// Type for event handlers
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>;
