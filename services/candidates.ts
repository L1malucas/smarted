'use server';

import { z } from 'zod';
import { applySchema } from '@/lib/schemas/candidate.schema';
import Candidate from '@/models/Candidate';
import Job from '@/models/Job';
import databasePromise from '@/lib/mongodb';
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

async function applyToJobActionInternal(payload: z.infer<typeof applySchema>) {
  // 1. Validate payload using Zod schema
  const validatedData = applySchema.parse(payload);

  // Connect to database
  const db = await databasePromise;

  // 2. Verify job existence and get tenantId
  const job = await Job.findById(validatedData.jobId);
  if (!job) {
    return { success: false, error: 'Vaga não encontrada.' };
  }

  // 3. Business Logic: Create a new candidate record
  const newCandidate = new Candidate({
    jobId: new mongoose.Types.ObjectId(validatedData.jobId),
    tenantId: job.tenantId, // Associate candidate with job's tenant
    name: validatedData.name,
    email: validatedData.email,
    phone: validatedData.phone,
    resumeUrl: validatedData.resumeUrl, // Placeholder for actual file upload
    answers: validatedData.answers,
    status: "applied", // Initial status
  });

  await newCandidate.save();

  // Optionally, increment candidatesCount in the Job model
  await Job.findByIdAndUpdate(job._id, { $inc: { candidatesCount: 1 } });

  return { success: true, data: { candidateId: newCandidate._id.toString() } };
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

  // Connect to database
  const db = await databasePromise;

  // 2. Validate Tenancy and fetch candidate details
  const candidate = await Candidate.findById(candidateId);

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
  // const simulatedExtractedSkills = ["JavaScript", "React", "Node.js"]; // Removed unused variable

  // Update candidate status and AI results
  candidate.status = "evaluated"; // Or "processing" then "evaluated"
  candidate.matchScore = simulatedMatchScore;
  // candidate.extractedSkills = simulatedExtractedSkills; // Add this field to ICandidate if needed

  await candidate.save();

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

  // Connect to database
  const db = await databasePromise;

  // 2. Validate Tenancy and fetch job details
  const job = await Job.findById(jobId);
  if (!job) {
    return { success: false, error: 'Vaga não encontrada.' };
  }

  if (job.tenantId !== session.tenantId) {
    return { success: false, error: 'Você não tem permissão para ranquear candidatos para esta vaga.' };
  }

  // 3. Business Logic: Get candidates and apply ranking logic
  const candidates = await Candidate.find({ jobId: new mongoose.Types.ObjectId(jobId), tenantId: session.tenantId });

  // Simulate ranking logic (e.g., based on matchScore)
  candidates.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  // Update candidate ranking/score (if needed, otherwise just return sorted list)
  // For now, we'll just return the sorted list.

  return { success: true, data: { candidates: candidates.map(c => c.toObject()) } };
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
