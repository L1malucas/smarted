"use server";

import { getUsersCollection, getCandidatesCollection } from "@/infrastructure/persistence/db";
import { ObjectId } from "mongodb";
import { withActionLogging } from "@/shared/lib/actions";
import { IUser } from "@/domain/models/User"; 
import { IActionLogConfig, IActionResult } from "@/shared/types/types/action-interface";
import { ICandidate } from "@/domain/models/Candidate";
import { getJobsCollection } from "@/infrastructure/persistence/db";
import { uploadResumeAction } from "./file-actions";

async function getCurrentUser(): Promise<{ userId: string; tenantId: string; userName: string }> {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" }) as IUser;
  if (!user) throw new Error("Authenticated user not found.");
  return {
    userId: user._id!.toString(),
    tenantId: user.tenantId!,
    userName: user.name || "Unknown User",
  };
}

async function getCandidateDetailsActionInternal(candidateId: string): Promise<IUser | null> {
  const { tenantId } = await getCurrentUser();
  const usersCollection = await getUsersCollection();
  const candidate = await usersCollection.findOne({ _id: new ObjectId(candidateId) as any, tenantId });
  return JSON.parse(JSON.stringify(candidate));
}

export const getCandidateDetailsAction = async (candidateId: string) => {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Detalhes do Candidato",
    resourceType: "Candidate",
    resourceId: candidateId,
    success: false
  };
  return await withActionLogging(getCandidateDetailsActionInternal, logConfig)(candidateId);
};

export const submitApplicationAction = withActionLogging(
  async (formData: FormData) => {
    const jobId = formData.get("jobId") as string;
    const candidateEmail = formData.get("candidateEmail") as string;
    const resumeFile = formData.get("resumeFile") as File;
    const answers = JSON.parse(formData.get("answers") as string);

    if (!jobId || !candidateEmail || !resumeFile) {
      throw new Error("Dados de candidatura incompletos.");
    }

    const jobsCollection = await getJobsCollection();
    const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any });
    if (!job) {
      throw new Error("Vaga não encontrada.");
    }

    const uploadResult = await uploadResumeAction(formData);
    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(uploadResult.error || "Falha ao fazer upload do currículo.");
    }
    const resumeUrl: string = uploadResult.data;

    const candidatesCollection = await getCandidatesCollection();

    const newCandidate: ICandidate = {
      _id: new ObjectId().toString(),
      jobId: jobId,
      tenantId: (job as any).tenantId, 
      name: candidateEmail, 
      email: candidateEmail,
      resumeUrl: resumeUrl,
      status: "applied",
      answers: answers,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await candidatesCollection.insertOne(newCandidate as any);

    await jobsCollection.updateOne(
      { _id: new ObjectId(jobId) as any },
      { $inc: { candidatesCount: 1 } }
    );

    return { success: true, data: newCandidate };
  },
  {
    userId: "public-candidate", 
    userName: "Public Candidate",
    actionType: "Submeter Candidatura",
    resourceType: "Candidate",
    resourceId: "", 
    success: false,
  } as IActionLogConfig
);

export const getCandidatesForJobAction = withActionLogging(
  async (jobId: string) => {
    const { tenantId } = await getCurrentUser();
    const candidatesCollection = await getCandidatesCollection();
    const candidates = await candidatesCollection.find({ jobId, tenantId }).toArray() as unknown as ICandidate[];
    return candidates;
  },
  {
    userId: "", // Will be populated by getCurrentUser
    userName: "", // Will be populated by getCurrentUser
    actionType: "Listar Candidatos por Vaga",
    resourceType: "Candidate",
    resourceId: "", // Will be populated by jobId
    success: false,
  } as IActionLogConfig
);
