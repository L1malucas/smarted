import { z } from 'zod';

export const createLinkSchema = z.object({
  type: z.enum(['job', 'report', 'dashboard']), // Define types of shareable resources
  resourceId: z.string().min(1, 'ID do recurso é obrigatório.'),
  options: z.object({
    password: z.string().optional(),
    expirationDate: z.string().optional(), // ISO date string
  }).optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const verifyLinkSchema = z.object({
  hash: z.string().min(1, 'Hash é obrigatório.'),
  password: z.string().optional(),
});

export type VerifyLinkInput = z.infer<typeof verifyLinkSchema>;