import { DomainEvent } from '@domain/events';
import { EventDispatcher, EventHandler } from '@application/services/EventDispatcher';

// In-memory event dispatcher for testing and simple scenarios
// Events are dispatched synchronously to registered handlers
export class InMemoryEventDispatcher implements EventDispatcher {
  private handlers = new Map<string, EventHandler[]>();

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler as EventHandler]);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(
      eventType,
      existing.filter((h) => h !== handler),
    );
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map((h) => h(event)));
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }

  // For testing: clear all handlers
  clear(): void {
    this.handlers.clear();
  }

  // For testing: get all handlers for an event type
  getHandlers(eventType: string): EventHandler[] {
    return this.handlers.get(eventType) ?? [];
  }
}
