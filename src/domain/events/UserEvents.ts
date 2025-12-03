import { BaseDomainEvent } from './DomainEvent';

// Event: User was registered in the system
export class UserRegisteredEvent extends BaseDomainEvent {
  readonly eventType = 'USER_REGISTERED';

  constructor(
    aggregateId: string,
    readonly payload: {
      email: string;
      role: string;
    },
  ) {
    super(aggregateId);
  }
}

// Event: User logged in
export class UserLoggedInEvent extends BaseDomainEvent {
  readonly eventType = 'USER_LOGGED_IN';

  constructor(
    aggregateId: string,
    readonly payload: {
      email: string;
      loginAt: string;
    },
  ) {
    super(aggregateId);
  }
}

// Event: User was deactivated
export class UserDeactivatedEvent extends BaseDomainEvent {
  readonly eventType = 'USER_DEACTIVATED';

  constructor(
    aggregateId: string,
    readonly payload: {
      reason?: string;
    },
  ) {
    super(aggregateId);
  }
}

// Event: User changed their email
export class UserEmailChangedEvent extends BaseDomainEvent {
  readonly eventType = 'USER_EMAIL_CHANGED';

  constructor(
    aggregateId: string,
    readonly payload: {
      previousEmail: string;
      newEmail: string;
    },
  ) {
    super(aggregateId);
  }
}

// Event: User was deleted
export class UserDeletedEvent extends BaseDomainEvent {
  readonly eventType = 'USER_DELETED';

  constructor(
    aggregateId: string,
    readonly payload: {
      email: string;
    },
  ) {
    super(aggregateId);
  }
}
