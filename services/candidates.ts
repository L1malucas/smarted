'use server';

import { z } from 'zod';
import { applySchema } from '@/lib/schemas/candidate.schema';
import { ICandidate } from '@/models/Candidate';
import { IJob } from '@/models/Job';
import { getCandidatesCollection, getJobsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withActionLogging } from '@/lib/actions'; // Updated import
import { ActionLogConfig } from '@/types/action-interface'; // Import ActionLogConfig

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function getSession() {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) {
    return {
      userId: null,
      tenantId: null,
      roles: [],
      userName: "Unknown User",
    };
  }
  try {
    const decoded = await verifyToken(accessToken);
    if (decoded) {
      return {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        roles: decoded.roles,
        userName: decoded.name || "Unknown User",
      };
    }
  } catch (error) {
    console.error("Error getting session in candidates service:", error);
  }
  return {
    userId: null,
    tenantId: null,
    roles: [],
    userName: "Unknown User",
  };
}

async function applyToJobActionInternal(payload: z.infer<typeof applySchema>) {
  // 1. Validate payload using Zod schema
  const validatedData = applySchema.parse(payload);

  const jobsCollection = await getJobsCollection();
  const candidatesCollection = await getCandidatesCollection();

  // 2. Verify job existence and get tenantId
  const job = await jobsCollection.findOne({ _id: new ObjectId(validatedData.jobId) }) as IJob;
  if (!job) {
    return { success: false, error: 'Vaga não encontrada.' };
  }

  // 3. Business Logic: Create a new candidate record
  const newCandidate: ICandidate = {
    jobId: new ObjectId(validatedData.jobId),
    tenantId: job.tenantId, // Associate candidate with job's tenant
    name: validatedData.name,
    email: validatedData.email,
    phone: validatedData.phone,
    resumeUrl: validatedData.resumeUrl, // Placeholder for actual file upload
    answers: validatedData.answers ? validatedData.answers.map(answer => ({ ...answer, questionId: new ObjectId(answer.questionId) })) : [],
    status: "applied", // Initial status
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await candidatesCollection.insertOne(newCandidate);

  // Optionally, increment candidatesCount in the Job model
  await jobsCollection.updateOne({ _id: job._id }, { $inc: { candidatesCount: 1 } });

  return { success: true, data: { candidateId: result.insertedId.toString() } };
}

async function processResumeWithAIActionInternal(candidateId: string) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Check if user has permission to initiate AI analysis
  if (!session.roles.includes("admin") && !session.roles.includes("recruiter")) {
    return { success: false, error: 'Você não tem permissão para iniciar a análise de IA.' };
  }

  const candidatesCollection = await getCandidatesCollection();

  // 2. Validate Tenancy and fetch candidate details
  const candidate = await candidatesCollection.findOne({ _id: new ObjectId(candidateId) }) as ICandidate;

  if (!candidate) {
    return { success: false, error: 'Candidato não encontrado.' };
  }

  // Ensure the candidate belongs to the user's tenant
  if (candidate.tenantId !== session.tenantId) {
    return { success: false, error: 'Você não tem permissão para processar este candidato.' };
  }

  // 3. Business Logic: Simulate AI processing
  // In a real scenario, you would call an external AI service here.
  // For example: const aiResult = await externalAIService.analyzeResume(candidate.resumeUrl);

  // Simulate AI results
  const simulatedMatchScore = Math.floor(Math.random() * 100) + 1; // Random score between 1 and 100

  // Update candidate status and AI results
  await candidatesCollection.updateOne(
    { _id: new ObjectId(candidateId) },
    { $set: { status: "evaluated", matchScore: simulatedMatchScore, updatedAt: new Date() } }
  );

  return { success: true };
}

async function rankCandidatesActionInternal(jobId: string) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Check if user has permission to rank candidates
  if (!session.roles.includes("admin") && !session.roles.includes("recruiter")) {
    return { success: false, error: 'Você não tem permissão para ranquear candidatos.' };
  }

  const jobsCollection = await getJobsCollection();
  const candidatesCollection = await getCandidatesCollection();

  // 2. Validate Tenancy and fetch job details
  const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) }) as IJob;
  if (!job) {
    return { success: false, error: 'Vaga não encontrada.' };
  }

  if (job.tenantId !== session.tenantId) {
    return { success: false, error: 'Você não tem permissão para ranquear candidatos para esta vaga.' };
  }

  // 3. Business Logic: Get candidates and apply ranking logic
  const candidates = await candidatesCollection.find({ jobId: new ObjectId(jobId), tenantId: session.tenantId }).toArray() as ICandidate[];

  // Simulate ranking logic (e.g., based on matchScore)
  candidates.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return { success: true, data: { candidates: candidates } };
}

export const applyToJobAction = async (payload: z.infer<typeof applySchema>) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Aplicar para Vaga",
    resourceType: "Candidate",
    resourceId: "", // Will be populated after creation
    successMessage: "Candidatura enviada com sucesso!",
    errorMessage: "Erro ao aplicar para a vaga.",
  };
  const wrappedAction = withActionLogging(applyToJobActionInternal, logConfig);
  const result = await wrappedAction(payload);
  if (result.success && result.data && result.data.candidateId) {
    logConfig.resourceId = result.data.candidateId;
  }
  return result;
};

export const processResumeWithAIAction = async (candidateId: string) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Processar Currículo com IA",
    resourceType: "Candidate",
    resourceId: candidateId,
    successMessage: "Currículo processado com IA com sucesso!",
    errorMessage: "Erro ao processar currículo com IA.",
  };
  const wrappedAction = withActionLogging(processResumeWithAIActionInternal, logConfig);
  return await wrappedAction(candidateId);
};

export const rankCandidatesAction = async (jobId: string) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Ranqueamento de Candidatos",
    resourceType: "Job",
    resourceId: jobId,
    successMessage: "Candidatos ranqueados com sucesso!",
    errorMessage: "Erro ao ranquear candidatos.",
  };
  const wrappedAction = withActionLogging(rankCandidatesActionInternal, logConfig);
  return await wrappedAction(jobId);
};
