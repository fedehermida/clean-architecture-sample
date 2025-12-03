import { Result, ok, err } from '@shared/Result';
import { InvalidOperationError } from '@shared/errors';
import { DomainEvent, UserRegisteredEvent, UserDeactivatedEvent, UserEmailChangedEvent } from '@domain/events';

// User roles for access control
export enum UserRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

// Domain Layer: Core business entity with business rules
export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export class User {
  private props: UserProps;
  private domainEvents: DomainEvent[] = [];

  private constructor(props: UserProps) {
    this.props = props;
  }

  // Factory method for creating new users
  static create(params: {
    id: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
    createdAt?: Date;
  }): User {
    const user = new User({
      id: params.id,
      email: params.email.toLowerCase().trim(),
      passwordHash: params.passwordHash,
      role: params.role ?? UserRole.MEMBER,
      isActive: true,
      lastLoginAt: null,
      createdAt: params.createdAt ?? new Date(),
    });

    // Emit domain event for new user registration
    user.addDomainEvent(
      new UserRegisteredEvent(params.id, {
        email: params.email,
        role: params.role ?? UserRole.MEMBER,
      }),
    );

    return user;
  }

  // Factory method for reconstituting from persistence (no events emitted)
  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // ============================================================================
  // BUSINESS METHODS
  // ============================================================================

  // Check if user can access admin panel
  canAccessAdminPanel(): boolean {
    return this.props.role === UserRole.ADMIN && this.props.isActive;
  }

  // Check if user is a moderator or higher
  canModerate(): boolean {
    return (
      (this.props.role === UserRole.MODERATOR || this.props.role === UserRole.ADMIN) &&
      this.props.isActive
    );
  }

  // Record a login - returns new User instance (immutability)
  recordLogin(): User {
    return new User({
      ...this.props,
      lastLoginAt: new Date(),
    });
  }

  // Deactivate user account
  deactivate(reason?: string): Result<User, InvalidOperationError> {
    if (!this.props.isActive) {
      return err(InvalidOperationError.userAlreadyDeactivated());
    }

    const deactivatedUser = new User({
      ...this.props,
      isActive: false,
    });

    deactivatedUser.addDomainEvent(
      new UserDeactivatedEvent(this.props.id, { reason }),
    );

    return ok(deactivatedUser);
  }

  // Reactivate user account
  reactivate(): Result<User, InvalidOperationError> {
    if (this.props.isActive) {
      return err(new InvalidOperationError('User is already active'));
    }

    return ok(
      new User({
        ...this.props,
        isActive: true,
      }),
    );
  }

  // Change user email
  changeEmail(newEmail: string): User {
    const normalizedEmail = newEmail.toLowerCase().trim();
    const previousEmail = this.props.email;

    const updatedUser = new User({
      ...this.props,
      email: normalizedEmail,
    });

    updatedUser.addDomainEvent(
      new UserEmailChangedEvent(this.props.id, {
        previousEmail,
        newEmail: normalizedEmail,
      }),
    );

    return updatedUser;
  }

  // Promote user to a new role
  promote(newRole: UserRole): Result<User, InvalidOperationError> {
    if (this.props.role === UserRole.ADMIN) {
      return err(new InvalidOperationError('User is already an admin'));
    }

    if (newRole === this.props.role) {
      return err(new InvalidOperationError(`User already has role: ${newRole}`));
    }

    return ok(
      new User({
        ...this.props,
        role: newRole,
      }),
    );
  }

  // Check if user has been inactive for N days
  hasBeenInactiveDays(days: number): boolean {
    if (!this.props.lastLoginAt) {
      // Never logged in - calculate from creation date
      const daysSinceCreation = Math.floor(
        (Date.now() - this.props.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysSinceCreation >= days;
    }

    const daysSinceLogin = Math.floor(
      (Date.now() - this.props.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceLogin >= days;
  }

  // ============================================================================
  // DOMAIN EVENTS
  // ============================================================================

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  // Pull and clear domain events (called after persistence)
  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  // Check if there are pending domain events
  hasDomainEvents(): boolean {
    return this.domainEvents.length > 0;
  }
}
