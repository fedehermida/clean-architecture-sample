import { ProductRepository } from '@domain/repositories/ProductRepository';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const GetProductByIdSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
});

export type GetProductByIdDTO = z.infer<typeof GetProductByIdSchema>;

// Output DTO
export interface ProductOutput {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isInStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Application Layer: Use case for retrieving a product by ID
export class GetProductById {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: GetProductByIdDTO): Promise<Result<ProductOutput>> {
    const parse = GetProductByIdSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const product = await this.productRepository.findById(parse.data.productId);
    if (!product) {
      return err(new Error('Product not found'));
    }

    return ok({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      isInStock: product.isInStock(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }
}
