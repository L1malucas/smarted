"use server";

import { withActionLogging } from "@/shared/lib/actions";
import { IActionLogConfig } from "@/shared/types/types/action-interface";
import { IJob } from "@/domain/models/Job";
import { IJobStatus } from "@/domain/models/JobStatus";
import { ICandidate } from "@/domain/models/Candidate";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getUsersCollection, getJobsCollection, getNotificationsCollection } from "../persistence/db";
import { createNotificationAction } from "./notification-actions";
import { IUser } from "@/domain/models/User";

// Helper to get current user's info (mocked for now)
// In a real app, you'd get this from the session
async function getCurrentUser(): Promise<{ userId: string; tenantId: string; userName: string }> {
  // This is a placeholder. Replace with actual session logic.
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" }) as IUser;
  if (!user) throw new Error("Authenticated user not found.");
  return {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    userName: user.name || "Unknown User",
  };
}

async function getAllJobsActionInternal(tenantSlug: string): Promise<IJob[]> {
  const { tenantId } = await getCurrentUser();
  const jobsCollection = await getJobsCollection();
  const jobs = await jobsCollection.find({ tenantId }).toArray();
  return JSON.parse(JSON.stringify(jobs));
}

export const getAllJobsAction = async (tenantSlug: string) => {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar Vagas",
    resourceType: "Job",
    resourceId: tenantSlug,
    success: false
  };
  return await withActionLogging(getAllJobsActionInternal, logConfig)(tenantSlug);
};

async function createJobActionInternal(jobData: Omit<IJob, "_id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy" | "createdByUserName" | "status" | "slug">): Promise<IJob> {
  const session = await getCurrentUser();
  const jobsCollection = await getJobsCollection();

  const newJob: IJob = {
    ...jobData,
    _id: new ObjectId(),
    tenantId: session.tenantId,
    createdBy: session.userId,
    createdByUserName: session.userName,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active", // Default status for new jobs
    slug: jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''), // Generate slug from title
  };

  const result = await jobsCollection.insertOne(newJob);
  const createdJob = { ...newJob, _id: result.insertedId.toString() };

  // Create a notification for the job creator
  await createNotificationAction({
    recipientId: session.userId,
    senderId: "system",
    senderName: "Sistema",
    type: "job_created",
    message: `A vaga "${createdJob.title}" foi criada com sucesso.`, 
    resourceType: "job",
    resourceId: createdJob._id,
  });

  revalidatePath(`/${session.tenantId}/jobs`);
  return createdJob;
}

export const createJobAction = async (jobData: Omit<IJob, "_id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy" | "createdByUserName" | "status" | "slug">) => {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Criar Vaga",
    resourceType: "Job",
    resourceId: "", // Will be populated after creation
    success: false
  };
  return await withActionLogging(createJobActionInternal, logConfig)(jobData);
};

async function updateJobStatusActionInternal(tenantSlug: string, jobId: string, newStatus: IJobStatus, userId: string, userName: string): Promise<{ success: boolean, data?: IJob, error?: string }> {
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

export const updateJobStatusAction = async (tenantSlug: string, jobId: string, newStatus: IJobStatus, userId: string, userName: string) => {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Atualizar Status da Vaga",
    resourceType: "Job",
    resourceId: jobId,
    details: `Status da vaga ${jobId} atualizado para ${newStatus}.`,
    success: false
  };
  return await withActionLogging(updateJobStatusActionInternal, logConfig)(tenantSlug, jobId, newStatus, userId, userName);
};

async function getJobDetailsActionInternal(jobId: string): Promise<IJob | null> {
  const jobsCollection = await getJobsCollection();
  const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) }) as IJob;
  return JSON.parse(JSON.stringify(job));
}

export const getJobDetailsAction = async (jobId: string) => {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Detalhes da Vaga",
    resourceType: "Job",
    resourceId: jobId,
    success: false
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
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Candidatos da Vaga",
    resourceType: "Candidate",
    resourceId: jobId,
    success: false
  };
  return await withActionLogging(getCandidatesForJobActionInternal, logConfig)(jobId);
};

async function getJobBySlugActionInternal(jobSlug: string): Promise<IJob | null> {
  const jobsCollection = await getJobsCollection();
  const job = await jobsCollection.findOne({ slug: jobSlug }) as IJob;
  return JSON.parse(JSON.stringify(job));
}

export const getJobBySlugAction = async (jobSlug: string) => {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Vaga por Slug",
    resourceType: "Job",
    resourceId: jobSlug,
    success: false
  };
  return await withActionLogging(getJobBySlugActionInternal, logConfig)(jobSlug);
};

async function submitApplicationActionInternal(jobSlug: string, resumeFile: File, answers: CandidateAnswer[]): Promise<{ success: boolean, error?: string }> {
  // Placeholder for actual application submission logic
  // In a real app, you would handle file upload to storage (e.g., S3) and save candidate data to DB
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
  return { success: true };
}

export const submitApplicationAction = async (jobSlug: string, resumeFile: File, answers: CandidateAnswer[]) => {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: "candidate-anonymous", // Placeholder: replace with actual candidate ID/info if available
    userName: "Candidato Anônimo", // Placeholder
    actionType: "Submeter Candidatura",
    resourceType: "JobApplication",
    resourceId: jobSlug,
    success: false
  };
  return await withActionLogging(submitApplicationActionInternal, logConfig)(jobSlug, resumeFile, answers);
};

async function uploadResumeActionInternal(jobId: string, file: File): Promise<{ success: boolean, error?: string, url?: string }> {
  // In a real application, you would upload the file to a storage service (e.g., AWS S3, Google Cloud Storage)
  // and then save the URL to your database.
  // For now, we'll simulate the upload.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload time
  const simulatedUrl = `/uploads/${jobId}/${file.name}`;
  return { success: true, url: simulatedUrl };
}

export const uploadResumeAction = async (jobId: string, file: File) => {
  const session = await getCurrentUser(); // Assuming a user is logged in, even if anonymous
  const logConfig: IActionLogConfig = {
    userId: session.userId || "",
    userName: session.userName || "Sistema",
    actionType: "Upload de Currículo",
    resourceType: "Resume",
    resourceId: jobId,
    details: `Upload do currículo ${file.name} para a vaga ${jobId}.`,
    success: false
  };
  return await withActionLogging(uploadResumeActionInternal, logConfig)(jobId, file);
};

async function uploadResumeActionInternal(jobId: string, file: File): Promise<{ success: boolean, error?: string, url?: string }> {
  // In a real application, you would upload the file to a storage service (e.g., AWS S3, Google Cloud Storage)
  // and then save the URL to your database.
  // For now, we'll simulate the upload.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload time
  const simulatedUrl = `/uploads/${jobId}/${file.name}`;
  return { success: true, url: simulatedUrl };
}

export const uploadResumeAction = async (jobId: string, file: File) => {
  const session = await getCurrentUser(); // Assuming a user is logged in, even if anonymous
  const logConfig: IActionLogConfig = {
    userId: session.userId || "",
    userName: session.userName || "Sistema",
    actionType: "Upload de Currículo",
    resourceType: "Resume",
    resourceId: jobId,
    details: `Upload do currículo ${file.name} para a vaga ${jobId}.`,
    success: false
  };
  return await withActionLogging(uploadResumeActionInternal, logConfig)(jobId, file);
};
