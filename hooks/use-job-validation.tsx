import { useState } from 'react';
import { z } from 'zod';
import { Job } from '@/types/jobs-interface';

const competencySchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Nome da competência deve ter no mínimo 3 caracteres'),
  weight: z.number().min(1).max(5),
});

const questionSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'O texto da pergunta é obrigatório'),
  type: z.enum(['text', 'multiple_choice', 'single_choice', 'file_upload']),
  options: z.array(z.string().min(1, 'A opção não pode estar vazia')).optional(),
  required: z.boolean(),
  order: z.number().min(0),
}).refine(
  (data) => {
    if (['multiple_choice', 'single_choice'].includes(data.type)) {
      return data.options && data.options.length >= 2;
    }
    return true;
  },
  { message: 'Perguntas de múltipla escolha devem ter pelo menos 2 opções' }
);

const salaryRangeSchema = z.object({
  min: z.number().min(0, 'O salário mínimo deve ser maior ou igual a 0'),
  max: z.number().min(0, 'O salário máximo deve ser maior ou igual a 0'),
  currency: z.string().min(1, 'A moeda é obrigatória'),
}).optional().refine(
  (data) => !data || data.max >= data.min,
  { message: 'O salário máximo deve ser maior ou igual ao mínimo' }
);

const jobSchema = z.object({
  title: z.string()
    .min(20, 'O título da vaga deve ter no mínimo 20 caracteres')
    .max(200, 'O título da vaga deve ter no máximo 200 caracteres'),
  description: z.string()
    .min(100, 'A descrição da vaga deve ter no mínimo 100 caracteres')
    .max(5000, 'A descrição da vaga deve ter no máximo 5000 caracteres'),
  department: z.string().min(1, 'O departamento é obrigatório'),
  location: z.string().min(1, 'A localização é obrigatória'),
  salaryRange: salaryRangeSchema,
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  tags: z.array(z.string()).optional(),
  closingDate: z.date().optional(),
  competencies: z.array(competencySchema)
    .min(3, 'A vaga deve ter no mínimo 3 competências')
    .refine(
      (competencies) => competencies.every(comp => comp.name.trim().length >= 3),
      'Todas as competências devem ter um nome válido com pelo menos 3 caracteres'
    ),
  questions: z.array(questionSchema).optional(),
});

const draftJobSchema = z.object({
  title: z.string().max(200, 'O título da vaga deve ter no máximo 200 caracteres').optional(),
  description: z.string().max(5000, 'A descrição da vaga deve ter no máximo 5000 caracteres').optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  salaryRange: z.number().optional(),
  employmentType: z.string().optional(),
  experienceLevel: z.string().optional(),
  tags: z.array(z.string()).optional(),
  closingDate: z.string().optional(),
  competencies: z.array(competencySchema).optional().default([]),
  questions: z.array(questionSchema).optional().default([]),
});

export interface ValidationErrors {
  title?: string;
  description?: string;
  department?: string;
  location?: string;
  salaryRange?: string;
  competencies?: any;
  questions?: any;
}

export function useJobValidation() {
  const [errors, setErrors] = useState<ValidationErrors>();

  const validateJob = (job: Partial<Job>, isDraft = false): boolean => {
    try {
      const dataToValidate = {
        title: job.title || '',
        description: job.description || '',
        department: job.department || '',
        location: job.location || '',
        salaryRange: job.salaryRange,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        tags: job.tags,
        closingDate: job.closingDate,
        competencies: job.competencies || [],
        questions: job.questions || [],
      };

      if (isDraft) {
        draftJobSchema.parse(dataToValidate);
      } else {
        jobSchema.parse(dataToValidate);
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ValidationErrors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        return false;
      }
      console.error('Validation error:', error);
      return false;
    }
  };

  const validateField = (field: keyof ValidationErrors, value: any): boolean => {
    try {
      switch (field) {
        case 'title':
          jobSchema.shape.title.parse(value);
          break;
        case 'description':
          jobSchema.shape.description.parse(value);
          break;
        case 'department':
          jobSchema.shape.department.parse(value);
          break;
        case 'location':
          jobSchema.shape.location.parse(value);
          break;
        case 'salaryRange':
          jobSchema.shape.salaryRange.parse(value);
          break;
        case 'competencies':
          jobSchema.shape.competencies.parse(value);
          break;
        case 'questions':
          jobSchema.shape.questions.parse(value);
          break;
      }
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0].message,
        }));
        return false;
      }
      return false;
    }
  };

  const getFieldError = (field: keyof ValidationErrors): string | undefined => {
    return errors?.[field];
  };

  const hasFieldError = (field: keyof ValidationErrors): boolean => {
    return errors?.[field];
  };

  const clearFieldError = (field: keyof ValidationErrors): void => {
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const clearAllErrors = (): void => {
    setErrors({});
  };

  return {
    errors,
    validateJob,
    validateField,
    getFieldError,
    hasFieldError,
    clearFieldError,
    clearAllErrors,
  };
}