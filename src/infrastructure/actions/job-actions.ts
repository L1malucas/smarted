"use server";
import { z } from "zod";
import { withActionLogging } from "@/shared/lib/actions";
import { getJobsCollection } from "../persistence/db";
import { IJob } from "@/domain/models/Job";
import { ObjectId } from "mongodb";
import { IJobStatus } from "@/domain/models/JobStatus";
import { jobSchema, draftJobSchema, updateJobSchema } from "@/application/schemas/job.schema";
import { getCurrentUser, serializeJob } from "@/shared/lib/server-utils";
import { IActionLogConfig } from "@/shared/types/types/action-interface";
export const createJobAction = withActionLogging(
  async (jobData: Partial<IJob>, isDraft: boolean = false) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado.");
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
      createdBy: user.userId,
      createdByName: user.userName,
      tenantId: user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: isDraft ? "draft" : "aberta",
      isDraft: isDraft,
      statusChangeLog: [{
        status: isDraft ? "draft" : "aberta",
        changedAt: new Date(),
        changedBy: user.userId,
        changedByName: user.userName,
      }],
      criteriaWeights: validatedData.criteriaWeights,
      candidatesCount: validatedData.candidatesCount || 0,
    };
    const result = await jobsCollection.insertOne(newJobForDb as any);
    const createdJob = serializeJob({ ...newJobForDb, _id: result.insertedId });
    return createdJob;
  },
  {
    userId: "", 
    userName: "", 
    actionType: "Criar Vaga",
    resourceType: "Job",
    resourceId: "", 
    success: false,
  } as IActionLogConfig
);
export const updateJobAction = withActionLogging(
  async (jobId: string, jobData: Partial<IJob>) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado.");
    const jobsCollection = await getJobsCollection();
    const existingJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any, tenantId: user.tenantId }) as unknown as IJob;
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
      { _id: new ObjectId(jobId) as any, tenantId: user.tenantId },
      { $set: updateFields }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Nenhuma alteração realizada ou vaga não encontrada.");
    }
    const updatedJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any }) as unknown as IJob;
    return serializeJob(updatedJob);
  },
  {
    userId: "", 
    userName: "", 
    actionType: "Atualizar Vaga",
    resourceType: "Job",
    resourceId: "", 
    success: false,
  } as IActionLogConfig
);
export const deleteJobAction = withActionLogging(
  async (jobId: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado.");
    const jobsCollection = await getJobsCollection();
    const jobToDelete = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any, tenantId: user.tenantId }) as unknown as IJob;
    if (!jobToDelete) throw new Error("Vaga não encontrada ou não pertence ao tenant.");
    if (jobToDelete.createdBy !== user.userId && !user.isAdmin) {
      throw new Error("Você não tem permissão para deletar esta vaga.");
    }
    const result = await jobsCollection.deleteOne({ _id: new ObjectId(jobId) as any, tenantId: user.tenantId });
    if (result.deletedCount === 0) {
      throw new Error("Nenhuma vaga encontrada para exclusão.");
    }
    return { success: true };
  },
  {
    userId: "", 
    userName: "", 
    actionType: "Deletar Vaga",
    resourceType: "Job",
    resourceId: "", 
    success: false,
  } as IActionLogConfig
);
export const getJobByIdAction = withActionLogging(
  async (jobId: string) => {
    const user = await getCurrentUser();
    const jobsCollection = await getJobsCollection();
    const query: any = { _id: new ObjectId(jobId) as any };
    if (user) {
      query.tenantId = user.tenantId;
    }
    const job = await jobsCollection.findOne(query) as unknown as IJob;
    if (!job) {
      throw new Error("Vaga não encontrada.");
    }
    if (!user && job.status !== "aberta") {
      throw new Error("Vaga não encontrada ou não está aberta para visualização pública.");
    }
    return serializeJob(job);
  },
  {
    userId: "", 
    userName: "", 
    actionType: "Obter Vaga por ID",
    resourceType: "Job",
    resourceId: "", 
    success: false,
  } as IActionLogConfig
);
export const getJobBySlugAction = withActionLogging(
  async (slug: string) => {
    const jobsCollection = await getJobsCollection();
    const job = await jobsCollection.findOne({ slug }) as unknown as IJob;
    return serializeJob(job);
  },
  {
    userId: "", 
    userName: "", 
    actionType: "Obter Vaga por Slug",
    resourceType: "Job",
    resourceId: "", 
    success: false,
  } as IActionLogConfig
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
    const user = await getCurrentUser();
    const jobsCollection = await getJobsCollection();
    const { status, searchQuery, page = 1, limit = 10, sortBy, tenantId } = filters;
    const query: any = {};
    if (tenantId) {
      query.tenantId = tenantId;
    }
    query.status = "aberta";
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
  {
    userId: "", 
    userName: "", 
    actionType: "Listar Vagas",
    resourceType: "Job",
    resourceId: "", 
    success: false,
  } as IActionLogConfig
);
export const updateJobStatusAction = withActionLogging(
  async (jobId: string, newStatus: IJobStatus) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado.");
    const jobsCollection = await getJobsCollection();
    const existingJob = await jobsCollection.findOne({ _id: new ObjectId(jobId) as any, tenantId: user.tenantId }) as unknown as IJob;
    if (!existingJob) throw new Error("Vaga não encontrada ou não pertence ao tenant.");
    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(jobId) as any, tenantId: user.tenantId },
      { 
        $set: { 
          status: newStatus, 
          updatedAt: new Date(), 
          lastStatusUpdateBy: user.userId, 
          lastStatusUpdateByName: user.userName 
        },
        $push: {
          statusChangeLog: {
            status: newStatus,
            changedAt: new Date(),
            changedBy: user.userId,
            changedByName: user.userName,
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
  {
    userId: "", 
    userName: "", 
    actionType: "Atualizar Status da Vaga",
    resourceType: "Job",
    resourceId: "", 
    success: false,
  } as IActionLogConfig
);
