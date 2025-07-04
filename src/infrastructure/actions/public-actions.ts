"use server";

import { getJobsCollection, getCandidatesCollection, getShareableLinksCollection } from "@/infrastructure/persistence/db";
import { ObjectId } from "mongodb";
import { withActionLogging } from "@/shared/lib/actions";
import { ActionLogConfig } from "@/shared/types/types/action-interface";
import { Job } from "@/shared/types/types/jobs-interface";

// Helper to get current user's info (mocked for now)
async function getCurrentUser() {
  // This is a placeholder. For public actions, user might be anonymous
  return {
    userId: "anonymous",
    userName: "Anônimo",
    tenantId: "public",
  };
}

async function getPublicCandidateDetailsActionInternal(hash: string): Promise<{ jobTitle: string, candidates: PublicCandidate[] } | null> {
  const shareableLinksCollection = await getShareableLinksCollection();
  const jobsCollection = await getJobsCollection();
  const candidatesCollection = await getCandidatesCollection();

  const link = await shareableLinksCollection.findOne({ hash });

  if (!link || link.expiresAt < new Date()) {
    throw new Error("Link inválido ou expirado.");
  }

  const job = await jobsCollection.findOne({ _id: new ObjectId(link.resourceId) }) as Job;
  if (!job) {
    throw new Error("Vaga associada ao link não encontrada.");
  }

  const candidates = await candidatesCollection.find({ jobId: new ObjectId(link.resourceId) }).toArray() as PublicCandidate[];

  return { jobTitle: job.title, candidates: JSON.parse(JSON.stringify(candidates)) };
}

export const getPublicCandidateDetailsAction = async (hash: string) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Visualizar Detalhes Públicos de Candidato",
    resourceType: "PublicCandidate",
    resourceId: hash,
    successMessage: "Detalhes públicos do candidato obtidos com sucesso!",
    errorMessage: "Erro ao obter detalhes públicos do candidato.",
  };
  return await withActionLogging(getPublicCandidateDetailsActionInternal, logConfig)(hash);
};

async function getPublicJobDetailsActionInternal(hash: string, password?: string): Promise<{ job: Job | null, error?: string }> {
  const shareableLinksCollection = await getShareableLinksCollection();
  const jobsCollection = await getJobsCollection();

  const link = await shareableLinksCollection.findOne({ hash });

  if (!link || link.expiresAt < new Date()) {
    throw new Error("Link inválido ou expirado.");
  }

  if (link.password && link.password !== password) {
    throw new Error("Senha incorreta.");
  }

  const job = await jobsCollection.findOne({ _id: new ObjectId(link.resourceId) }) as Job;
  if (!job) {
    throw new Error("Vaga associada ao link não encontrada.");
  }

  return { job: JSON.parse(JSON.stringify(job)) };
}

export const getPublicJobDetailsAction = async (hash: string, password?: string) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Visualizar Detalhes Públicos da Vaga",
    resourceType: "PublicJob",
    resourceId: hash,
    successMessage: "Detalhes públicos da vaga obtidos com sucesso!",
    errorMessage: "Erro ao obter detalhes públicos da vaga.",
  };
  return await withActionLogging(getPublicJobDetailsActionInternal, logConfig)(hash, password);
};

async function createShareableLinkActionInternal(resourceType: string, resourceId: string, resourceName: string, tenantSlug: string, isPasswordProtected: boolean, password?: string, expiryDays?: number): Promise<{ success: boolean, error?: string, hash?: string }> {
  const shareableLinksCollection = await getShareableLinksCollection();

  const newLink = {
    resourceType,
    resourceId: new ObjectId(resourceId),
    resourceName,
    tenantSlug,
    isPasswordProtected,
    password: isPasswordProtected ? password : undefined,
    hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Simple hash for now
    expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined,
    createdAt: new Date(),
  };

  const result = await shareableLinksCollection.insertOne(newLink);

  return { success: true, hash: newLink.hash };
}

export const createShareableLinkAction = async (resourceType: string, resourceId: string, resourceName: string, tenantSlug: string, isPasswordProtected: boolean, password?: string, expiryDays?: number) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Criar Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: resourceId,
    details: `Link compartilhável criado para ${resourceType} ${resourceName}.`,
    successMessage: "Link compartilhável criado com sucesso!",
    errorMessage: "Erro ao criar link compartilhável.",
  };
  return await withActionLogging(createShareableLinkActionInternal, logConfig)(resourceType, resourceId, resourceName, tenantSlug, isPasswordProtected, password, expiryDays);
};
