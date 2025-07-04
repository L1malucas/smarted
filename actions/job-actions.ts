"use server";

import { revalidatePath } from "next/cache";
import { getJobsCollection, getUsersCollection } from "@/lib/db";
import { Job, JobStatus } from "@/types/jobs-interface";
import { withActionLogging } from "@/lib/actions";
import { ActionLogConfig } from "@/types/action-interface";

// Helper to get current user's info (mocked for now)
// In a real app, you'd get this from the session
async function getCurrentUser() {
  // This is a placeholder. Replace with actual session logic.
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" });
  if (!user) throw new Error("Authenticated user not found.");
  return {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    userName: user.name || "Unknown User",
  };
}

async function getAllJobsActionInternal(tenantSlug: string): Promise<Job[]> {
  const { tenantId } = await getCurrentUser();
  const jobsCollection = await getJobsCollection();
  const jobs = await jobsCollection.find({ tenantId }).toArray();
  return JSON.parse(JSON.stringify(jobs));
}

export const getAllJobsAction = async (tenantSlug: string) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar Vagas",
    resourceType: "Job",
    resourceId: tenantSlug,
    successMessage: "Vagas listadas com sucesso!",
    errorMessage: "Erro ao listar vagas.",
  };
  return await withActionLogging(getAllJobsActionInternal, logConfig)(tenantSlug);
};

async function updateJobStatusActionInternal(tenantSlug: string, jobId: string, newStatus: JobStatus, userId: string, userName: string): Promise<{ success: boolean, data?: Job, error?: string }> {
  const jobsCollection = await getJobsCollection();
  const result = await jobsCollection.findOneAndUpdate(
    { _id: new ObjectId(jobId), tenantId: tenantSlug },
    { $set: { status: newStatus, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!result.value) {
    throw new Error("Vaga não encontrada ou não pertence ao tenant.");
  }

  revalidatePath(`/${tenantSlug}/jobs`);
  return { success: true, data: JSON.parse(JSON.stringify(result.value)) };
}

export const updateJobStatusAction = async (tenantSlug: string, jobId: string, newStatus: JobStatus, userId: string, userName: string) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Atualizar Status da Vaga",
    resourceType: "Job",
    resourceId: jobId,
    details: `Status da vaga ${jobId} atualizado para ${newStatus}.`,
    successMessage: "Status da vaga atualizado com sucesso!",
    errorMessage: "Erro ao atualizar status da vaga.",
  };
  return await withActionLogging(updateJobStatusActionInternal, logConfig)(tenantSlug, jobId, newStatus, userId, userName);
};

async function getJobDetailsActionInternal(jobId: string): Promise<Job | null> {
  const jobsCollection = await getJobsCollection();
  const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) });
  return JSON.parse(JSON.stringify(job));
}

export const getJobDetailsAction = async (jobId: string) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Detalhes da Vaga",
    resourceType: "Job",
    resourceId: jobId,
    successMessage: "Detalhes da vaga obtidos com sucesso!",
    errorMessage: "Erro ao obter detalhes da vaga.",
  };
  return await withActionLogging(getJobDetailsActionInternal, logConfig)(jobId);
};

async function getCandidatesForJobActionInternal(jobId: string): Promise<Candidate[]> {
  const candidatesCollection = await getUsersCollection(); // Assuming candidates are users
  const candidates = await candidatesCollection.find({ jobId: new ObjectId(jobId) }).toArray();
  return JSON.parse(JSON.stringify(candidates));
}

export const getCandidatesForJobAction = async (jobId: string) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Candidatos da Vaga",
    resourceType: "Candidate",
    resourceId: jobId,
    successMessage: "Candidatos da vaga obtidos com sucesso!",
    errorMessage: "Erro ao obter candidatos da vaga.",
  };
  return await withActionLogging(getCandidatesForJobActionInternal, logConfig)(jobId);
};
