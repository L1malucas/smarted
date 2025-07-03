'use server';

import Job from '@/models/Job';
import dbConnect from '@/lib/mongodb';
import { Job as JobType } from '@/types/jobs-interface';

export async function getPublicJobsAction(tenantSlug?: string): Promise<{ success: boolean; data?: JobType[]; error?: string }> {
  try {
    await dbConnect();

    const query: any = {
      status: 'aberta',
      isDraft: false,
    };

    if (tenantSlug) {
      // Assuming tenantSlug is part of the job's slug or a separate field
      // Adjust this query based on how tenantSlug is associated with jobs
      query.slug = { $regex: tenantSlug, $options: 'i' }; // Example: search for tenantSlug in job slug
    }

    const jobs = await Job.find(query).lean();

    return { success: true, data: jobs as JobType[] };
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    return { success: false, error: 'Failed to fetch public jobs.' };
  }
}