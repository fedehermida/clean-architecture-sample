// Domain Layer: Core business entity with business rules
export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(params: { id: string; email: string; passwordHash: string; createdAt?: Date }) {
    return new User({ ...params, createdAt: params.createdAt ?? new Date() });
  }

  get id() {
    return this.props.id;
  }

  get email() {
    return this.props.email;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}


