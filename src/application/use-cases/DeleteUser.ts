import { UserRepository } from '@domain/repositories/UserRepository';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const DeleteUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type DeleteUserDTO = z.infer<typeof DeleteUserSchema>;

// Application Layer: Use case for deleting a user
export class DeleteUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeleteUserDTO): Promise<Result<void>> {
    const parse = DeleteUserSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const user = await this.userRepository.findById(parse.data.userId);
    if (!user) {
      return err(new Error('User not found'));
    }

    await this.userRepository.deleteById(parse.data.userId);
    return ok(undefined);
  }
}

