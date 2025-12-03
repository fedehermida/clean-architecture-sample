import { ProductRepository } from '@domain/repositories/ProductRepository';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const DeleteProductSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
});

export type DeleteProductDTO = z.infer<typeof DeleteProductSchema>;

// Application Layer: Use case for deleting a product
export class DeleteProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: DeleteProductDTO): Promise<Result<void>> {
    const parse = DeleteProductSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const product = await this.productRepository.findById(parse.data.productId);
    if (!product) {
      return err(new Error('Product not found'));
    }

    await this.productRepository.deleteById(parse.data.productId);
    return ok(undefined);
  }
}
