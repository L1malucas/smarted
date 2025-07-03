import { z } from 'zod';

export const loginSchema = z.object({
  cpf: z.string().min(1, { message: 'CPF é obrigatório.' }),
});

export type LoginInput = z.infer<typeof loginSchema>;