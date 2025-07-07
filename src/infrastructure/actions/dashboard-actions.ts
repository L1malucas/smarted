"use server";

import { JobStatus } from "@/shared/types/jobs-constants";
import { getUsersCollection, getJobsCollection } from "@/infrastructure/persistence/db";
import { IActionLogConfig } from "@/shared/types/types/action-interface";
import { withActionLogging } from "@/shared/lib/actions";

async function getCurrentUser(): Promise<{ userId: string; tenantId: string; userName: string }> {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" }) as IUser;
  if (!user) throw new Error("Authenticated user not found.");
  return {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    userName: user.name || "Unknown User",
  };
}

async function getDashboardMetricsInternal(tenantId: string) {
  const jobsCollection = await getJobsCollection();
  const candidatesCollection = await getUsersCollection(); // Assuming candidates are users

  const totalJobs = await jobsCollection.countDocuments({ tenantId });
  const pendingJobs = await jobsCollection.countDocuments({ tenantId, status: IJobStatus.Draft });
  const totalCandidates = await candidatesCollection.countDocuments({ tenantId, roles: 'candidate' }); // Assumption

  const metrics = {
    totalVagasCriadas: totalJobs,
    totalCandidatos: totalCandidates,
    totalContatos: 0, // Placeholder
    totalMatches: 0, // Placeholder
    totalAcoesPendentes: pendingJobs,
  };

  return metrics;
}

export const getDashboardMetrics = async (tenantId: string) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Métricas do Dashboard",
    resourceType: "Dashboard",
    resourceId: tenantId,
    success: false
  };
  return await withActionLogging(getDashboardMetricsInternal, logConfig)(tenantId);
};

async function getUserActivityDataInternal(tenantId: string, period: "7d" | "30d" | "90d") {
  // No mock data, return empty array if no real data
  return [];
}

export const getUserActivityData = async (tenantId: string, period: "7d" | "30d" | "90d") => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Atividade do Usuário",
    resourceType: "Dashboard",
    resourceId: tenantId,
    success: false
  };
  return await withActionLogging(getUserActivityDataInternal, logConfig)(tenantId, period);
};
