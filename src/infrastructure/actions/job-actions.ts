"use server";

import { ObjectId } from "mongodb";
import { getJobsCollection } from "../persistence/db";
import { IJob } from "@/domain/models/Job";
import { IJobStatus } from "@/domain/models/JobStatus";
import { jobSchema, draftJobSchema, updateJobSchema } from "@/application/schemas/job.schema";
import { serializeJob } from "@/shared/lib/server-utils";
import { createLoggedAction } from "@/shared/lib/action-builder";

/**
 * Cria uma nova vaga (ou rascunho).
 */
export const createJobAction = createLoggedAction<
  [Partial<IJob>, boolean?],
  IJob
>({
  actionName: "Criar Vaga",
  resourceType: "Job",
  requireAuth: true,
  action: async ({ session, args: [jobData, isDraft = false] }) => {
    const jobsCollection = await getJobsCollection();
    const schema = isDraft ? draftJobSchema : jobSchema;
    const validatedData = schema.parse(jobData);
    
    const slug = (validatedData.title ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

    const newJobForDb = {
      ...validatedData,
      _id: new ObjectId(),
      slug,
      createdBy: session.userId,
      createdByName: session.name,
      tenantId: session.tenantId,
      tenantName: session.tenantName,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: isDraft ? "draft" : "aberta",
      isDraft,
      statusChangeLog: [{
        status: isDraft ? "draft" : "aberta",
        changedAt: new Date(),
        changedBy: session.userId,
        changedByName: session.name,
      }],
      candidatesCount: 0,
    };

    const result = await jobsCollection.insertOne(newJobForDb as any);
    return serializeJob({ ...newJobForDb, _id: result.insertedId });
  },
  getResourceId: (result) => result._id?.toString(),
});

/**
 * Atualiza uma vaga existente.
 */
export const updateJobAction = createLoggedAction<
  [string, Partial<IJob>],
  IJob
>({
  actionName: "Atualizar Vaga",
  resourceType: "Job",
  requireAuth: true,
  action: async ({ session, args: [jobId, jobData] }) => {
    const jobsCollection = await getJobsCollection();
    const validatedData = updateJobSchema.parse(jobData);
    const updateFields: Partial<IJob> = {
      updatedAt: new Date(),
    };
    for (const key in validatedData) {
      if (Object.prototype.hasOwnProperty.call(validatedData, key)) {
        if (key === 'status') {
          updateFields.status = validatedData.status as IJobStatus;
        } else {
          (updateFields as any)[key] = (validatedData as any)[key];
        }
      }
    }
    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(jobId) as any, tenantId: session.tenantId },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Nenhuma alteração realizada ou vaga não encontrada.");
    }
    const updatedJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) }) as IJob;
    return serializeJob(updatedJob);
  },
  getResourceId: (_, args) => args[0],
});

/**
 * Deleta uma vaga.
 */
export const deleteJobAction = createLoggedAction<
  [string],
  { success: boolean }
>({
  actionName: "Deletar Vaga",
  resourceType: "Job",
  requireAuth: true,
  action: async ({ session, args: [jobId] }) => {
    const jobsCollection = await getJobsCollection();
    const jobToDelete = await jobsCollection.findOne({ _id: new ObjectId(jobId), tenantId: session.tenantId }) as IJob;

    if (!jobToDelete) throw new Error("Vaga não encontrada ou não pertence ao tenant.");
    if (jobToDelete.createdBy !== session.userId && !session.isAdmin) {
      throw new Error("Você não tem permissão para deletar esta vaga.");
    }

    const result = await jobsCollection.deleteOne({ _id: new ObjectId(jobId), tenantId: session.tenantId });
    if (result.deletedCount === 0) throw new Error("Nenhuma vaga encontrada para exclusão.");
    
    return { success: true };
  },
  getResourceId: (_, args) => args[0],
});

/**
 * Obtém uma vaga pelo seu ID.
 * Pode ser acessada por usuários não autenticados se a vaga for pública.
 */
export const getJobByIdAction = createLoggedAction<
  [string],
  IJob
>({
  actionName: "Obter Vaga por ID",
  resourceType: "Job",
  requireAuth: false, // Permite acesso público
  action: async ({ session, args: [jobId] }) => {
    const jobsCollection = await getJobsCollection();
    const query: any = { _id: new ObjectId(jobId) };

    // Se houver sessão, restringe ao tenant do usuário
    if (session) {
      query.tenantId = session.tenantId;
    }

    const job = await jobsCollection.findOne(query) as IJob;
    if (!job) throw new Error("Vaga não encontrada.");

    // Se não houver sessão, só permite ver vagas abertas
    if (!session && job.status !== "aberta") {
      throw new Error("Vaga não disponível para visualização pública.");
    }

    return serializeJob(job);
  },
  getResourceId: (_, args) => args[0],
});

/**
 * Obtém uma vaga pelo seu slug.
 * Ação pública.
 */
export const getJobBySlugAction = createLoggedAction<
  [string],
  IJob | null
>({
  actionName: "Obter Vaga por Slug",
  resourceType: "Job",
  requireAuth: false,
  action: async ({ args: [slug] }) => {
    const jobsCollection = await getJobsCollection();
    const job = await jobsCollection.findOne({ slug }) as IJob;
    return job ? serializeJob(job) : null;
  },
  getResourceId: (_, args) => args[0],
});

/**
 * Lista vagas com base em filtros.
 * Acessível publicamente para vagas abertas, ou com filtros de tenant para usuários logados.
 */
export const listJobsAction = createLoggedAction<
  [{ status?: string; searchQuery?: string; page?: number; limit?: number; sortBy?: string; tenantId?: string; }],
  { data: IJob[]; total: number; }
>({
  actionName: "Listar Vagas",
  resourceType: "Job",
  requireAuth: false,
  action: async ({ session, args: [filters] }) => {
    const { status, searchQuery, page = 1, limit = 10, sortBy, tenantId } = filters;
    const jobsCollection = await getJobsCollection();
    const query: any = {};

    const effectiveTenantId = session?.tenantId ?? tenantId;

    if (effectiveTenantId) {
      query.tenantId = effectiveTenantId;
      if (status) query.status = status;
    } else {
      query.status = "aberta"; // Apenas vagas abertas para buscas públicas
    }

    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }

    const sortOptions: any = sortBy ? { [sortBy.split(":")[0]]: sortBy.split(":")[1] === 'desc' ? -1 : 1 } : { createdAt: -1 };

    const jobs = await jobsCollection.find(query).sort(sortOptions).skip((page - 1) * limit).limit(limit).toArray() as IJob[];
    const total = await jobsCollection.countDocuments(query);

    return {
      data: jobs.map(serializeJob),
      total,
    };
  },
});

/**
 * Atualiza o status de uma vaga.
 */
export const updateJobStatusAction = createLoggedAction<
  [string, IJobStatus],
  IJob
>({
  actionName: "Atualizar Status da Vaga",
  resourceType: "Job",
  requireAuth: true,
  action: async ({ session, args: [jobId, newStatus] }) => {
    const jobsCollection = await getJobsCollection();
    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(jobId), tenantId: session.tenantId },
      {
        $set: { 
          status: newStatus, 
          updatedAt: new Date(), 
          lastStatusUpdateBy: session.userId, 
          lastStatusUpdateByName: session.name 
        },
        $push: {
          statusChangeLog: { status: newStatus, changedAt: new Date(), changedBy: session.userId, changedByName: session.name },
        },
      }
    );

    if (result.modifiedCount === 0) throw new Error("Nenhuma alteração de status realizada.");

    const updatedJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) }) as IJob;
    return serializeJob(updatedJob);
  },
  getResourceId: (_, args) => args[0],
});