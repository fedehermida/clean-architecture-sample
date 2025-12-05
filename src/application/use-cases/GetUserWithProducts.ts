import { UserRepository } from '@domain/repositories/UserRepository';
import { ProductRepository } from '@domain/repositories/ProductRepository';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const GetUserWithProductsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type GetUserWithProductsDTO = z.infer<typeof GetUserWithProductsSchema>;

// Product response type
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// User with products response type
export interface UserWithProductsResponse {
  id: string;
  email: string;
  createdAt: Date;
  products: ProductResponse[];
}

// Application Layer: Use case for retrieving a user with their associated products
export class GetUserWithProducts {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: GetUserWithProductsDTO): Promise<Result<UserWithProductsResponse>> {
    const parse = GetUserWithProductsSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const user = await this.userRepository.findById(parse.data.userId);
    if (!user) {
      return err(new Error('User not found'));
    }

    const products = await this.productRepository.findByUserId(parse.data.userId);

    return ok({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    });
  }
}
