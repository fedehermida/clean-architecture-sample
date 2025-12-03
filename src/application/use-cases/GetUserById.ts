import { UserRepository } from '@domain/repositories/UserRepository';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const GetUserByIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type GetUserByIdDTO = z.infer<typeof GetUserByIdSchema>;

// Application Layer: Use case for retrieving a user by ID
export class GetUserById {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetUserByIdDTO): Promise<Result<{ id: string; email: string; createdAt: Date }>> {
    const parse = GetUserByIdSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const user = await this.userRepository.findById(parse.data.userId);
    if (!user) {
      return err(new Error('User not found'));
    }

    return ok({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  }
}

