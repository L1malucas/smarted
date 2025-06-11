import { Job } from '@/types/jobs-interface';

const STORAGE_KEY = 'jobs';

export class PublicJobService {
  private getStoredJobs(): Job[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async getPublicJobs(tenantSlug?: string): Promise<Job[]> {
    try {
      const jobs = this.getStoredJobs();
      return jobs.filter(job =>
        job.status === 'aberta' &&
        !job.isDraft &&
        (!tenantSlug || job.slug.includes(tenantSlug))
      );
    } catch (error) {
      console.error('Error fetching public jobs:', error);
      throw new Error('Failed to fetch public jobs');
    }
  }
}