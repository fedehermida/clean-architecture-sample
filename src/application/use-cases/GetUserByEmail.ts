import { UserRepository } from '@domain/repositories/UserRepository';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const GetUserByEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type GetUserByEmailDTO = z.infer<typeof GetUserByEmailSchema>;

// Application Layer: Use case for retrieving a user by email
export class GetUserByEmail {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetUserByEmailDTO): Promise<Result<{ id: string; email: string; createdAt: Date }>> {
    const parse = GetUserByEmailSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const user = await this.userRepository.findByEmail(parse.data.email);
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

