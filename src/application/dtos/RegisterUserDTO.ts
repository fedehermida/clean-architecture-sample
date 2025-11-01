import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;


