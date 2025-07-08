"use server";

import { ObjectId } from "mongodb";
import { getCandidatesCollection, getJobsCollection, getUsersCollection } from "@/infrastructure/persistence/db";
import { ICandidate } from "@/domain/models/Candidate";
import { IUser } from "@/domain/models/User";
import { createLoggedAction } from "@/shared/lib/action-builder";
import { uploadResumeAction } from "./file-actions";
import { serializeCandidate } from "@/shared/lib/server-utils";


// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

/**
 * Obtém os detalhes de um candidato específico.
 */
export const getCandidateDetailsAction = createLoggedAction<
  [string],
  IUser | null
>({
  actionName: "Obter Detalhes do Candidato",
  resourceType: "Candidate",
  requireAuth: true,
  action: async ({ session, args: [candidateId] }) => {
    const usersCollection = await getUsersCollection();
    const candidate = await usersCollection.findOne({ 
      _id: new ObjectId(candidateId) as any, 
      tenantId: session.tenantId 
    });
    return JSON.parse(JSON.stringify(candidate));
  },
  getResourceId: (_, args) => args[0],
});

/**
 * Submete uma nova candidatura para uma vaga.
 * Esta action é pública, mas o log registra a tentativa.
 */
export const submitApplicationAction = createLoggedAction<
  [FormData],
  { success: boolean; data: ICandidate }
>({
  actionName: "Submeter Candidatura",
  resourceType: "Candidate",
  requireAuth: false, // Ação pública
  action: async ({ args: [formData] }) => {
    const jobId = formData.get("jobId") as string;
    console.log(`[submitApplicationAction] Recebido jobId do FormData: ${jobId}`);
    const candidateEmail = formData.get("candidateEmail") as string;
    const resumeFile = formData.get("resume") as File;
    const answers = JSON.parse(formData.get("answers") as string);

    if (!jobId || !candidateEmail || !resumeFile) {
      console.error("[submitApplicationAction] Dados de candidatura incompletos.");
      throw new Error("Dados de candidatura incompletos.");
    }

    const jobsCollection = await getJobsCollection();
    let jobQuery: any = {};

    if (isValidObjectId(jobId)) {
      jobQuery._id = new ObjectId(jobId);
      console.log(`[submitApplicationAction] Buscando vaga por ObjectId: ${jobId}`);
    } else {
      jobQuery.slug = jobId;
      console.log(`[submitApplicationAction] Buscando vaga por slug: ${jobId}`);
    }

    const job = await jobsCollection.findOne(jobQuery);
    console.log(`[submitApplicationAction] Resultado da busca pela vaga: ${job ? 'Encontrada' : 'Não encontrada'}`);

    if (!job) {
      throw new Error("Vaga não encontrada.");
    }

    // O upload do currículo já é uma action logada, então o log é tratado lá.
    const uploadResult = await uploadResumeAction(formData);
    if (!uploadResult.success || !uploadResult.data) {
      console.error(`[submitApplicationAction] Falha ao fazer upload do currículo: ${uploadResult.error}`);
      throw new Error(uploadResult.error || "Falha ao fazer upload do currículo.");
    }
    const resumeUrl: string = uploadResult.data;

    const candidatesCollection = await getCandidatesCollection();
    const newCandidate: ICandidate = {
      _id: new ObjectId(),
      jobId: job._id.toString(),
      tenantId: (job as any).tenantId,
      name: candidateEmail, // Simplificado, pode ser melhorado
      email: candidateEmail,
      resumeUrl: resumeUrl,
      status: "applied",
      answers: answers,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await candidatesCollection.insertOne(newCandidate as any);
    console.log(`[submitApplicationAction] Candidato inserido com ID: ${newCandidate._id?.toString()}`);

    await jobsCollection.updateOne(
      { _id: job._id },
      { $inc: { candidatesCount: 1 } }
    );
    console.log(`[submitApplicationAction] Contador de candidatos da vaga ${job._id.toHexString()} incrementado.`);

    return { success: true, data: serializeCandidate(newCandidate) };
  },
  getResourceId: (result) => result && result.data?._id?.toString(),
  getDetails: (result, error) => error ? `Erro: ${error.message}` : `Candidatura para a vaga ${result.data.jobId} submetida.`
});

/**
 * Lista todos os candidatos para uma vaga específica.
 */
export const getCandidatesForJobAction = createLoggedAction<
  [string],
  ICandidate[]
>({
  actionName: "Listar Candidatos por Vaga",
  resourceType: "Candidate",
  requireAuth: true,
  action: async ({ session, args: [jobId] }) => {
    const candidatesCollection = await getCandidatesCollection();
    const candidates = await candidatesCollection.find({ 
      jobId, 
      tenantId: session.tenantId 
    }).toArray() as unknown as ICandidate[];
    return candidates;
  },
  getResourceId: (_, args) => args[0], // jobId
});