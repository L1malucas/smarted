'use server';

import { z } from 'zod';
import { jobSchema, updateJobSchema } from '@/lib/schemas/job.schema';
import { IJob } from '@/models/Job';
import { getJobsCollection } from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils';
import { ObjectId } from 'mongodb';
import { withActionLogging } from '@/lib/actions'; // Updated import
import { ActionLogConfig } from '@/types/action-interface'; // Import ActionLogConfig

async function getSession() {
  const session = await getServerSession(authOptions);
  return {
    userId: session?.user?.id || null,
    tenantId: session?.user?.tenantId || null,
    roles: session?.user?.roles || [],
    userName: session?.user?.name || "Unknown User",
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

  const jobsCollection = await getJobsCollection();

  // 3. Business Logic: Create a new job document
  const newJob: IJob = {
    ...validatedData,
    slug: generateSlug(validatedData.title), // Generate slug from title
    tenantId: session.tenantId,
    createdBy: session.userId,
    createdByName: session.userName,
    status: "draft", // Initial status
    isDraft: true,
    candidatesCount: 0, // Initial count
    criteriaWeights: { // Default criteria weights, adjust as needed
      experience: 0, // Assuming 0 as default, adjust based on actual needs
      skills: 0,
      certifications: 0,
      behavioral: 0,
      leadership: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await jobsCollection.insertOne(newJob);

  return { success: true, data: { jobId: result.insertedId.toString() } };
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

  const jobsCollection = await getJobsCollection();

  // 3. Validate Tenancy and update job
  const result = await jobsCollection.updateOne(
    { _id: new ObjectId(jobId), tenantId: session.tenantId },
    { $set: { ...validatedData, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return { success: false, error: 'Vaga não encontrada ou você não tem permissão para atualizá-la.' };
  }

  return { success: true, data: { jobId: jobId } };
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

  const jobsCollection = await getJobsCollection();

  // 2. Validate Tenancy and update job status
  const result = await jobsCollection.updateOne(
    { _id: new ObjectId(jobId), tenantId: session.tenantId },
    { $set: { status: "fechada", updatedAt: new Date() } } // Assuming "fechada" means archived/closed
  );

  if (result.matchedCount === 0) {
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

  const jobsCollection = await getJobsCollection();

  // 2. Validate Tenancy and fetch job details
  const job = await jobsCollection.findOne(
    { _id: new ObjectId(jobId), tenantId: session.tenantId }
  ) as IJob;

  if (!job) {
    return { success: false, error: 'Vaga não encontrada ou você não tem permissão para visualizá-la.' };
  }

  return { success: true, data: { job: job } };
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