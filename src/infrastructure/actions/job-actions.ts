"use server";
import { z } from "zod";
import { withActionLogging } from "@/shared/lib/actions";
import { getJobsCollection } from "../persistence/db";
import { IJob } from "@/domain/models/Job";
import { ObjectId } from "mongodb";
import { IJobStatus } from "@/domain/models/JobStatus";
import { jobSchema, draftJobSchema, updateJobSchema } from "@/application/schemas/job.schema";
import { serializeJob } from "@/shared/lib/server-utils";
import { getSessionUser } from "./auth-actions";
import { IActionLogConfig } from "@/shared/types/types/action-interface";
export const createJobAction = withActionLogging(
  async (jobData: Partial<IJob>, isDraft: boolean = false) => {
    const session = await getSessionUser();
    if (!session) throw new Error("Usuário não autenticado.");
    const jobsCollection = await getJobsCollection();
    const schema = isDraft ? draftJobSchema : jobSchema;
    const validatedData = schema.parse(jobData);
    let slug = "";
    if (validatedData.title) {
      slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
    }
    const newJobForDb = {
      ...validatedData,
      _id: new ObjectId(), 
      slug: slug,
      createdBy: session.userId,
      createdByName: session.name,
      tenantId: session.tenantId,
      tenantName: session.tenantName,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: isDraft ? "draft" : "aberta",
      isDraft: isDraft,
      statusChangeLog: [{
        status: isDraft ? "draft" : "aberta",
        changedAt: new Date(),
        changedBy: session.userId,
        changedByName: session.name,
      }],
      criteriaWeights: validatedData.criteriaWeights,
      candidatesCount: validatedData.candidatesCount || 0,
    };
    const result = await jobsCollection.insertOne(newJobForDb as any);
    const createdJob = serializeJob({ ...newJobForDb, _id: result.insertedId });
    return createdJob;
  },
  "Criar Vaga",
  "Job",
  "",
  ""
);
export const updateJobAction = withActionLogging(
  async (jobId: string, jobData: Partial<IJob>) => {
    const session = await getSessionUser();
    if (!session) throw new Error("Usuário não autenticado.");
    const jobsCollection = await getJobsCollection();
    const existingJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any, tenantId: session.tenantId }) as unknown as IJob;
    if (!existingJob) throw new Error("Vaga não encontrada ou não pertence ao tenant.");
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
    const updatedJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any }) as unknown as IJob;
    return serializeJob(updatedJob);
  },
  "Atualizar Vaga",
  "Job",
  "",
  ""
);
export const deleteJobAction = withActionLogging(
  async (jobId: string) => {
    const session = await getSessionUser();
    if (!session) throw new Error("Usuário não autenticado.");
    const jobsCollection = await getJobsCollection();
    const jobToDelete = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any, tenantId: session.tenantId }) as unknown as IJob;
    if (!jobToDelete) throw new Error("Vaga não encontrada ou não pertence ao tenant.");
    if (jobToDelete.createdBy !== session.userId && !session.isAdmin) {
      throw new Error("Você não tem permissão para deletar esta vaga.");
    }
    const result = await jobsCollection.deleteOne({ _id: new ObjectId(jobId) as any, tenantId: session.tenantId });
    if (result.deletedCount === 0) {
      throw new Error("Nenhuma vaga encontrada para exclusão.");
    }
    return { success: true };
  },
  "Deletar Vaga",
  "Job",
  "",
  ""
);
export const getJobByIdAction = withActionLogging(
  async (jobId: string) => {
    const session = await getSessionUser();
    const jobsCollection = await getJobsCollection();
    const query: any = { _id: new ObjectId(jobId) as any };
    if (session) {
      query.tenantId = session.tenantId;
    }
    const job = await jobsCollection.findOne(query) as unknown as IJob;
    if (!job) {
      throw new Error("Vaga não encontrada.");
    }
    if (!session && job.status !== "aberta") {
      throw new Error("Vaga não encontrada ou não está aberta para visualização pública.");
    }
    return serializeJob(job);
  },
  "Obter Vaga por ID",
  "Job",
  "",
  ""
);
export const getJobBySlugAction = withActionLogging(
  async (slug: string) => {
    const jobsCollection = await getJobsCollection();
    const job = await jobsCollection.findOne({ slug }) as unknown as IJob;
    return serializeJob(job);
  },
  "Obter Vaga por Slug",
  "Job",
  "",
  ""
);
export const listJobsAction = withActionLogging(
  async (filters: {
    status?: string;
    searchQuery?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    tenantId?: string; 
  }) => {
    const session = await getSessionUser();
    const jobsCollection = await getJobsCollection();
    const { status, searchQuery, page = 1, limit = 10, sortBy } = filters;
    const query: any = {};

    let effectiveTenantId: string | undefined;
    if (session) {
      effectiveTenantId = session.tenantId;
    } else if (filters.tenantId) {
      effectiveTenantId = filters.tenantId;
    }

    if (effectiveTenantId) {
      query.tenantId = effectiveTenantId;
      if (status) {
        query.status = status;
      }
    } else {
      query.status = "aberta";
    }

    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }
    const sortOptions: any = {};
    if (sortBy) {
      const [field, order] = sortBy.split(":");
      sortOptions[field] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }
    const jobs = await jobsCollection
      .find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray() as unknown as IJob[];
    const total = await jobsCollection.countDocuments(query);
    const serializedJobs = jobs.map(job => serializeJob(job));
    return {
      data: serializedJobs as IJob[],
      total,
    };
  },
  "Listar Vagas",
  "Job",
  "",
  ""
);
export const updateJobStatusAction = withActionLogging(
  async (jobId: string, newStatus: IJobStatus) => {
    const session = await getSessionUser();
    if (!session) throw new Error("Usuário não autenticado.");
    const jobsCollection = await getJobsCollection();
    const existingJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any, tenantId: session.tenantId }) as unknown as IJob;
    if (!existingJob) throw new Error("Vaga não encontrada ou não pertence ao tenant.");
    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(jobId) as any, tenantId: session.tenantId },
      { 
        $set: { 
          status: newStatus, 
          updatedAt: new Date(), 
          lastStatusUpdateBy: session.userId, 
          lastStatusUpdateByName: session.name 
        },
        $push: {
          statusChangeLog: {
            status: newStatus,
            changedAt: new Date(),
            changedBy: session.userId,
            changedByName: session.name,
          },
        },
      }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Nenhuma alteração de status realizada.");
    }
    const updatedJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any }) as unknown as IJob;
    return serializeJob(updatedJob);
  },
  "Atualizar Status da Vaga",
  "Job",
  "",
  ""
);
