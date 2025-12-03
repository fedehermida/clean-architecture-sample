import { AuthenticationService } from '@application/services/AuthenticationService';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const LogoutUserSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type LogoutUserDTO = z.infer<typeof LogoutUserSchema>;

// Application Layer: Use case for user logout (token revocation)
export class LogoutUser {
  constructor(private readonly authService: AuthenticationService) {}

  async execute(input: LogoutUserDTO): Promise<Result<void>> {
    const parse = LogoutUserSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    await this.authService.revokeToken(parse.data.token);
    return ok(undefined);
  }
}
