import { ProductRepository } from '@domain/repositories/ProductRepository';
import { UserRepository } from '@domain/repositories/UserRepository';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const AssociateProductWithUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  productId: z.string().uuid('Invalid product ID format'),
});

export type AssociateProductWithUserDTO = z.infer<typeof AssociateProductWithUserSchema>;

// Application Layer: Use case for associating an existing product with a user (many-to-many)
export class AssociateProductWithUser {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: AssociateProductWithUserDTO): Promise<Result<void>> {
    const parse = AssociateProductWithUserSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    // Verify user exists
    const user = await this.userRepository.findById(parse.data.userId);
    if (!user) {
      return err(new Error('User not found'));
    }

    // Verify product exists
    const product = await this.productRepository.findById(parse.data.productId);
    if (!product) {
      return err(new Error('Product not found'));
    }

    // Associate product with user
    await this.productRepository.associateWithUser(parse.data.productId, parse.data.userId, product);

    return ok(undefined);
  }
}
