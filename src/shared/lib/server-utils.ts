import { cookies } from "next/headers";
import { verifyToken } from "@/infrastructure/auth/auth";
import { IJob } from "@/domain/models/Job";

// Helper to get current user's info
export async function getCurrentUser(): Promise<{ userId: string; tenantId: string; userName: string; isAdmin: boolean } | null> {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) return null; // Return null if no access token

  const decoded = await verifyToken(accessToken);
  if (!decoded) return null; // Return null if token is invalid

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
    criteriaWeights: job.criteriaWeights || { experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 },
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
