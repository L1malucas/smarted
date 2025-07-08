"use server";

import { getUsersCollection, getCandidatesCollection } from "@/infrastructure/persistence/db";
import { ObjectId } from "mongodb";
import { withActionLogging } from "@/shared/lib/actions";
import { IUser } from "@/domain/models/User"; 
import { IActionResult } from "@/shared/types/types/action-interface";
import { ICandidate } from "@/domain/models/Candidate";
import { getJobsCollection } from "@/infrastructure/persistence/db";
import { uploadResumeAction } from "./file-actions";
import { getSessionUser } from "./auth-actions";

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

async function getCandidateDetailsActionInternal(candidateId: string): Promise<IUser | null> {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized: No active session.");
  const usersCollection = await getUsersCollection();
  const candidate = await usersCollection.findOne({ _id: new ObjectId(candidateId) as any, tenantId: session.tenantId });
  return JSON.parse(JSON.stringify(candidate));
}

export const getCandidateDetailsAction = withActionLogging(
  getCandidateDetailsActionInternal,
  "Obter Detalhes do Candidato",
  "Candidate",
  "",
  ""
);

export const submitApplicationAction = withActionLogging(
  async (formData: FormData) => {
    const jobId = formData.get("jobId") as string;
    const candidateEmail = formData.get("candidateEmail") as string;
    const resumeFile = formData.get("resume") as File;
    const answers = JSON.parse(formData.get("answers") as string);

    if (!jobId || !candidateEmail || !resumeFile) {
      throw new Error("Dados de candidatura incompletos.");
    }

    const jobsCollection = await getJobsCollection();
    let job;

    if (isValidObjectId(jobId)) {
      job = await jobsCollection.findOne({ _id: new ObjectId(jobId) });
    } else {
      // Assuming jobId might be a slug or another identifier if not an ObjectId
      job = await jobsCollection.findOne({ slug: jobId }); 
    }

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
      { _id: job._id }, // Use job._id directly, which is already an ObjectId
      { $inc: { candidatesCount: 1 } }
    );

    return { success: true, data: newCandidate };
  },
  "Submeter Candidatura",
  "Candidate",
  "",
  ""
);

export const getCandidatesForJobAction = withActionLogging(
  async (jobId: string) => {
    const session = await getSessionUser();
    if (!session) throw new Error("Unauthorized: No active session.");
    const candidatesCollection = await getCandidatesCollection();
    const candidates = await candidatesCollection.find({ jobId, tenantId: session.tenantId }).toArray() as unknown as ICandidate[];
    return candidates;
  },
  "Listar Candidatos por Vaga",
  "Candidate",
  "",
  ""
);
