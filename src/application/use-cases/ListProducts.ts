import { ProductRepository } from '@domain/repositories/ProductRepository';
import { ok, Result } from '@shared/Result';

// Output DTO
export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  isInStock: boolean;
}

// Application Layer: Use case for listing all products
export class ListProducts {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<Result<ProductListItem[]>> {
    const products = await this.productRepository.findAll();

    return ok(
      products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        isInStock: product.isInStock(),
      })),
    );
  }
}
