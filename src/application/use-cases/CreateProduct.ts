import { randomUUID } from 'node:crypto';
import { ProductRepository } from '@domain/repositories/ProductRepository';
import { Product } from '@domain/entities/Product';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().max(1000, 'Description is too long').default(''),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

// Application Layer: Use case for creating a new product
export class CreateProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductDTO): Promise<Result<{ productId: string }>> {
    const parse = CreateProductSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const product = Product.create({
      id: randomUUID(),
      name: parse.data.name,
      description: parse.data.description,
      price: parse.data.price,
      stock: parse.data.stock,
    });

    await this.productRepository.save(product);

    return ok({ productId: product.id });
  }
}
