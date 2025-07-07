import { z } from "zod";
import { JOB_STATUS_VALUES } from "@/domain/models/JobStatus";

// Schema for Competency subdocument
export const competencySchema = z.object({
  id: z.string().uuid("ID da competência deve ser um UUID válido."),
  name: z.string().min(1, "Nome da competência é obrigatório."),
  weight: z.number().int().min(1).max(5, "Peso da competência deve ser entre 1 e 5."),
});

// Schema for JobQuestion subdocument
export const jobQuestionSchema = z.object({
  id: z.string().uuid("ID da pergunta deve ser um UUID válido."),
  question: z.string().min(1, "A pergunta é obrigatória."),
  type: z.enum(["text", "multiple_choice", "single_choice", "file_upload"]),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  order: z.number().int().min(0, "Ordem da pergunta deve ser um número não negativo."),
});

// Schema for CriteriaWeights subdocument
export const criteriaWeightsSchema = z.object({
  experience: z.number().int().min(0, "Peso da experiência deve ser não negativo."),
  skills: z.number().int().min(0, "Peso das habilidades deve ser não negativo."),
  certifications: z.number().int().min(0, "Peso das certificações deve ser não negativo."),
  behavioral: z.number().int().min(0, "Peso comportamental deve ser não negativo."),
  leadership: z.number().int().min(0, "Peso de liderança deve ser não negativo."),
});

// Base Job Schema (for full validation)
export const jobSchema = z.object({
  title: z.string().min(5, "Título deve ter no mínimo 5 caracteres.").max(200, "Título deve ter no máximo 200 caracteres."),
  slug: z.string().optional(), // Slug will be generated on the server
  description: z.string().min(100, "Descrição deve ter no mínimo 100 caracteres.").max(5000, "Descrição deve ter no máximo 5000 caracteres."),
  department: z.string().min(1, "Departamento é obrigatório.").optional(),
  location: z.string().min(1, "Localização é obrigatória.").optional(),
  salaryRange: z.object({
    min: z.number().int().min(0, "Salário mínimo deve ser não negativo."),
    max: z.number().int().min(0, "Salário máximo deve ser não negativo."),
    currency: z.string().min(1, "Moeda é obrigatória."),
  }).optional(),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]).optional(),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead"]).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(JOB_STATUS_VALUES).default("draft"),
  isPCDExclusive: z.boolean().default(false),
  isReferralJob: z.boolean().default(false),
  isDraft: z.boolean().default(true), // Default to true for draft schema
  competencies: z.array(competencySchema).min(3, "Deve haver no mínimo 3 competências."),
  questions: z.array(jobQuestionSchema).optional(),
  criteriaWeights: criteriaWeightsSchema.default({ experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 }),
  candidatesCount: z.number().int().min(0).default(0),
  // These fields are typically set by the server
  createdBy: z.string().optional(),
  createdByName: z.string().optional(),
  tenantId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastStatusUpdateBy: z.string().optional(),
  lastStatusUpdateByName: z.string().optional(),
  statusChangeLog: z.array(z.object({
    status: z.string(),
    changedAt: z.date(),
    changedBy: z.string(),
    changedByName: z.string(),
  })).optional(),
});

// Schema for creating a draft job (more flexible)
export const draftJobSchema = jobSchema.partial().extend({
  isDraft: z.literal(true).default(true),
});

// Schema for updating a job (all fields optional)
export const updateJobSchema = jobSchema.partial();
