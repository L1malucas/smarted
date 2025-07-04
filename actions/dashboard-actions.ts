
"use server";

import { getJobsCollection, getUsersCollection } from "@/lib/db";
import { JobStatus } from "@/types/jobs-interface";
import { withActionLogging } from "@/lib/actions";
import { ActionLogConfig } from "@/types/action-interface";

// Helper to get current user's info (mocked for now)
// In a real app, you'd get this from the session
async function getCurrentUser() {
  // This is a placeholder. Replace with actual session logic.
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" });
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
  const pendingJobs = await jobsCollection.countDocuments({ tenantId, status: JobStatus.PENDING });
  const totalCandidates = await candidatesCollection.countDocuments({ tenantId, roles: 'candidate' }); // Assumption

  // Mock data for now, will replace with real data
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
    successMessage: "Métricas do dashboard obtidas com sucesso!",
    errorMessage: "Erro ao obter métricas do dashboard.",
  };
  return await withActionLogging(getDashboardMetricsInternal, logConfig)(tenantId);
};

async function getUserActivityDataInternal(tenantId: string, period: "7d" | "30d" | "90d") {
  // Mock data for now, replace with real data from logs or user activity tracking
  return [
    { name: "Seg", logins: 10, acoes: 50 },
    { name: "Ter", logins: 12, acoes: 60 },
    { name: "Qua", logins: 8, acoes: 40 },
    { name: "Qui", logins: 15, acoes: 75 },
    { name: "Sex", logins: 11, acoes: 55 },
  ];
}

export const getUserActivityData = async (tenantId: string, period: "7d" | "30d" | "90d") => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Atividade do Usuário",
    resourceType: "Dashboard",
    resourceId: tenantId,
    successMessage: "Atividade do usuário obtida com sucesso!",
    errorMessage: "Erro ao obter atividade do usuário.",
  };
  return await withActionLogging(getUserActivityDataInternal, logConfig)(tenantId, period);
};
