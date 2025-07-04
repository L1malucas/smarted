'use server';

import Job from '@/models/Job';
import dbConnect from '@/lib/mongodb';
import { Job as JobType } from '@/types/jobs-interface';
import { withActionLogging } from '@/lib/actions';
import { ActionLogConfig } from '@/types/action-interface';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function getSession() {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) {
    return {
      userId: null,
      userName: "Unknown User",
    };
  }
  try {
    const decoded = await verifyToken(accessToken);
    if (decoded) {
      return {
        userId: decoded.userId,
        userName: decoded.name || "Unknown User",
      };
    }
  } catch (error) {
    // console.error("Error getting session in public jobs service:", error);
  }
  return {
    userId: null,
    userName: "Unknown User",
  };
}

async function getPublicJobsActionInternal(tenantSlug?: string): Promise<{ success: boolean; data?: JobType[]; error?: string }> {
  await dbConnect();

  const query: any = {
    status: 'aberta',
    isDraft: false,
  };

  if (tenantSlug) {
    query.slug = { $regex: tenantSlug, $options: 'i' };
  }

  const jobs = await Job.find(query).lean();

  return { success: true, data: jobs as JobType[] };
}

export const getPublicJobsAction = async (tenantSlug?: string) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId ?? "",
    userName: session.userName,
    actionType: "Buscar Vagas Públicas",
    resourceType: "Job",
    resourceId: tenantSlug || "all",
    successMessage: "Vagas públicas buscadas com sucesso!",
    errorMessage: "Erro ao buscar vagas públicas.",
  };
  return await withActionLogging(getPublicJobsActionInternal, logConfig)(tenantSlug);
};