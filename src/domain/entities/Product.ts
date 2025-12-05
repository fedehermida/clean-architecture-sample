// Domain Layer: Core business entity with business rules
// Products are independent entities - user associations are managed through a separate relationship
export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private props: ProductProps;

  private constructor(props: ProductProps) {
    this.props = props;
  }

  static create(params: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    const now = new Date();
    return new Product({
      ...params,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
    });
  }

  // Domain business rule: Check if product is in stock
  isInStock(): boolean {
    return this.props.stock > 0;
  }

  // Domain business rule: Check if can fulfill order quantity
  canFulfillOrder(quantity: number): boolean {
    return this.props.stock >= quantity;
  }

  // Domain business rule: Reduce stock (returns new Product instance - immutability)
  reduceStock(quantity: number): Product {
    if (!this.canFulfillOrder(quantity)) {
      throw new Error('Insufficient stock');
    }
    return new Product({
      ...this.props,
      stock: this.props.stock - quantity,
      updatedAt: new Date(),
    });
  }

  // Domain business rule: Increase stock (returns new Product instance - immutability)
  increaseStock(quantity: number): Product {
    return new Product({
      ...this.props,
      stock: this.props.stock + quantity,
      updatedAt: new Date(),
    });
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get price() {
    return this.props.price;
  }

  get stock() {
    return this.props.stock;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
