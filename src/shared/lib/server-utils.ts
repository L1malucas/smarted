import { cookies } from "next/headers";
import { verifyToken } from "@/infrastructure/auth/auth";
import { IJob } from "@/domain/models/Job";

// Helper to get current user's info
export async function getCurrentUser(): Promise<{ userId: string; tenantId: string; userName: string; isAdmin: boolean }> {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) throw new Error("Usuário não autenticado.");

  const decoded = await verifyToken(accessToken);
  if (!decoded) throw new Error("Token inválido.");

  return {
    userId: decoded.userId,
    tenantId: decoded.tenantId,
    userName: decoded.name || "Unknown User",
    isAdmin: decoded.isAdmin || false,
  };
}

// Helper to serialize job objects for client components
export function serializeJob(job: any): IJob {
  if (!job) return job;

  const serializedJob = {
    ...job,
    _id: job._id.toString(),
    createdBy: job.createdBy.toString(),
    createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
    updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : job.updatedAt,
  };

  if (serializedJob.competencies) {
    serializedJob.competencies = serializedJob.competencies.map((comp: any) => ({
      ...comp,
      _id: comp._id ? comp._id.toString() : undefined, // Handle optional _id
    }));
  }

  if (serializedJob.questions) {
    serializedJob.questions = serializedJob.questions.map((q: any) => ({
      ...q,
      _id: q._id ? q._id.toString() : undefined, // Handle optional _id
    }));
  }

  if (serializedJob.statusChangeLog) {
    serializedJob.statusChangeLog = serializedJob.statusChangeLog.map((log: any) => ({
      ...log,
      changedBy: log.changedBy.toString(),
      changedAt: log.changedAt instanceof Date ? log.changedAt.toISOString() : log.changedAt,
    }));
  }

  return serializedJob;
}
