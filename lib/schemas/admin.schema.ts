import { z } from 'zod';

export const createUserSchema = z.object({
  cpf: z.string().min(1, 'CPF é obrigatório.'),
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.string().email('Email inválido.'),
  roles: z.array(z.string()).min(1, 'Pelo menos uma função é obrigatória.'),
  tenantId: z.string().min(1, 'Tenant ID é obrigatório.'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const systemSettingsSchema = z.object({
  maxUsersPerTenant: z.number().min(1).optional(),
  // Add other system-wide settings here
});

export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
