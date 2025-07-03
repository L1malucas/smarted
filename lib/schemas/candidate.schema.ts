import { z } from 'zod';

export const applySchema = z.object({
  jobId: z.string().min(1, 'ID da vaga é obrigatório.'),
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().optional(),
  resumeUrl: z.string().url('URL do currículo inválida.').min(1, 'URL do currículo é obrigatória.'), // Placeholder for file upload URL
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string().min(1, 'Resposta é obrigatória.'),
  })).optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;
