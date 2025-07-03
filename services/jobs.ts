'use server';

import { z } from 'zod';
import { jobSchema, updateJobSchema } from '@/lib/schemas/job.schema';
import Job from '@/models/Job';
import databasePromise from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils';
import mongoose from 'mongoose';
import { withActionLogging } from '@/lib/actions'; // Updated import
import { ActionLogConfig } from '@/types/action-interface'; // Import ActionLogConfig

// Placeholder for session management. In a real app, use NextAuth.js or similar.
// This function should return the current user's session data, including userId, tenantId, roles, and userName.
async function getSession() {
  // For now, returning a dummy session. Replace with actual session retrieval.
  return {
    userId: "dummyUserId123",
    tenantId: "dummyTenantId456",
    roles: ["admin"], // or "recruiter"
    userName: "Dummy User", // Added userName
  };
}

async function createJobActionInternal(payload: z.infer<typeof jobSchema>) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Check if user has permission to create jobs
  if (!session.roles.includes("admin") && !session.roles.includes("recruiter")) {
    return { success: false, error: 'Você não tem permissão para criar vagas.' };
  }

  // 2. Validate payload using Zod schema
  const validatedData = jobSchema.parse(payload);

  // Connect to database
  const db = await databasePromise;

  // 3. Business Logic: Create a new job document
  const newJob = new Job({
    ...validatedData,
    slug: generateSlug(validatedData.title), // Generate slug from title
    tenantId: session.tenantId,
    createdBy: session.userId,
    createdByName: session.name,
    status: "draft", // Initial status
    isDraft: true,
    candidatesCount: 0, // Initial count
    criteriaWeights: { // Default criteria weights, adjust as needed
      competencies: 0.5,
      questions: 0.3,
      experience: 0.2,
    },
  });

  await newJob.save();

  return { success: true, data: { jobId: newJob._id.toString() } };
}

async function updateJobActionInternal(jobId: string, payload: z.infer<typeof updateJobSchema>) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Check if user has permission to update jobs
  if (!session.roles.includes("admin") && !session.roles.includes("recruiter")) {
    return { success: false, error: 'Você não tem permissão para atualizar vagas.' };
  }

  // 2. Validate payload using Zod schema
  const validatedData = updateJobSchema.parse(payload);

  // Connect to database
  const db = await databasePromise;

  // 3. Validate Tenancy and update job
  const updatedJob = await Job.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(jobId), tenantId: session.tenantId },
    { $set: validatedData },
    { new: true }
  );

  if (!updatedJob) {
    return { success: false, error: 'Vaga não encontrada ou você não tem permissão para atualizá-la.' };
  }

  return { success: true, data: { jobId: updatedJob._id.toString() } };
}

async function archiveJobActionInternal(jobId: string) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Check if user has permission to archive jobs
  if (!session.roles.includes("admin") && !session.roles.includes("recruiter")) {
    return { success: false, error: 'Você não tem permissão para arquivar vagas.' };
  }

  // Connect to database
  const db = await databasePromise;

  // 2. Validate Tenancy and update job status
  const archivedJob = await Job.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(jobId), tenantId: session.tenantId },
    { $set: { status: "fechada" } }, // Assuming "fechada" means archived/closed
    { new: true }
  );

  if (!archivedJob) {
    return { success: false, error: 'Vaga não encontrada ou você não tem permissão para arquivá-la.' };
  }

  return { success: true };
}

async function getJobDetailsActionInternal(jobId: string) {
  // 1. Authentication and Authorization
  const session = await getSession();
  // For public viewing (shared links), this check might be different or omitted.
  // For now, we assume authenticated access.
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Connect to database
  const db = await databasePromise;

  // 2. Validate Tenancy and fetch job details
  const job = await Job.findOne(
    { _id: new mongoose.Types.ObjectId(jobId), tenantId: session.tenantId }
  );

  if (!job) {
    return { success: false, error: 'Vaga não encontrada ou você não tem permissão para visualizá-la.' };
  }

  return { success: true, data: { job: job.toObject() } };
}

export const createJobAction = async (payload: z.infer<typeof jobSchema>) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Criar Vaga",
    resourceType: "Job",
    resourceId: "", // Will be populated after creation
    successMessage: "Vaga criada com sucesso!",
    errorMessage: "Erro ao criar vaga.",
  };
  const wrappedAction = withActionLogging(createJobActionInternal, logConfig);
  const result = await wrappedAction(payload);
  if (result.success && result.data && result.data.jobId) {
    logConfig.resourceId = result.data.jobId;
  }
  return result;
};

export const updateJobAction = async (jobId: string, payload: z.infer<typeof updateJobSchema>) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Atualizar Vaga",
    resourceType: "Job",
    resourceId: jobId,
    successMessage: "Vaga atualizada com sucesso!",
    errorMessage: "Erro ao atualizar vaga.",
  };
  const wrappedAction = withActionLogging(updateJobActionInternal, logConfig);
  return await wrappedAction(jobId, payload);
};

export const archiveJobAction = async (jobId: string) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Arquivar Vaga",
    resourceType: "Job",
    resourceId: jobId,
    successMessage: "Vaga arquivada com sucesso!",
    errorMessage: "Erro ao arquivar vaga.",
  };
  const wrappedAction = withActionLogging(archiveJobActionInternal, logConfig);
  return await wrappedAction(jobId);
};

export const getJobDetailsAction = async (jobId: string) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Detalhes da Vaga",
    resourceType: "Job",
    resourceId: jobId,
    successMessage: "Detalhes da vaga obtidos com sucesso!",
    errorMessage: "Erro ao obter detalhes da vaga.",
  };
  const wrappedAction = withActionLogging(getJobDetailsActionInternal, logConfig);
  return await wrappedAction(jobId);
};