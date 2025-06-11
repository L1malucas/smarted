import { v4 as uuidv4 } from 'uuid';
import { Job, JobStatus } from '@/types/jobs-interface';
import { AuditService } from './audit';

const STORAGE_KEY = 'jobs';

export class JobService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  private getStoredJobs(): Job[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveToStorage(jobs: Job[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (error) {
      throw new Error('Failed to save jobs to local storage');
    }
  }

  async saveJob(job: Omit<Job, '_id' | 'createdAt' | 'updatedAt' | 'candidatesCount'>): Promise<Job> {
    try {
      const jobs = this.getStoredJobs();
      const newJob: Job = {
        ...job,
        _id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        candidatesCount: 0,
        isDraft: job.isDraft ?? true,
      };

      jobs.push(newJob);
      this.saveToStorage(jobs);

      await this.auditService.saveAuditLog({
        userId: job.createdBy,
        userName: job.createdByName,
        actionType: 'create',
        resourceType: 'job',
        resourceId: newJob._id,
        details: `Job created: ${newJob.title}`,
        newState: newJob,
      });

      return newJob;
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  async updateJob(jobId: string, updates: Partial<Job>, userId: string, userName: string): Promise<Job> {
    try {
      const jobs = this.getStoredJobs();
      const jobIndex = jobs.findIndex(job => job._id === jobId);
      if (jobIndex === -1) {
        throw new Error('Job not found');
      }

      const existingJob = jobs[jobIndex];
      const updatedJob = {
        ...existingJob,
        ...updates,
        updatedAt: new Date(),
      };

      jobs[jobIndex] = updatedJob;
      this.saveToStorage(jobs);

      await this.auditService.saveAuditLog({
        userId,
        userName,
        actionType: 'update',
        resourceType: 'job',
        resourceId: jobId,
        details: `Job updated: ${updatedJob.title}`,
        previousState: existingJob,
        newState: updatedJob,
      });

      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async getAllJobs(): Promise<Job[]> {
    return this.getStoredJobs().filter(job => !job.isDraft);
  }

  async getJobById(jobId: string): Promise<Job | null> {
    const jobs = this.getStoredJobs();
    return jobs.find(job => job._id === jobId) || null;
  }

  async updateJobStatus(jobId: string, newStatus: JobStatus, userId: string, userName: string): Promise<Job> {
    try {
      const jobs = this.getStoredJobs();
      const jobIndex = jobs.findIndex(job => job._id === jobId);
      if (jobIndex === -1) {
        throw new Error('Job not found');
      }

      const job = jobs[jobIndex];
      const updatedJob = {
        ...job,
        status: newStatus,
        updatedAt: new Date(),
        lastStatusUpdateBy: userId,
        lastStatusUpdateByName: userName,
        statusChangeLog: [
          ...(job.statusChangeLog || []),
          {
            status: newStatus,
            changedAt: new Date(),
            changedBy: userId,
            changedByName: userName,
          },
        ],
      };

      jobs[jobIndex] = updatedJob;
      this.saveToStorage(jobs);

      await this.auditService.saveAuditLog({
        userId,
        userName,
        actionType: 'status_change',
        resourceType: 'job',
        resourceId: jobId,
        details: `Status changed to ${newStatus}`,
        previousState: { status: job.status },
        newState: { status: newStatus },
      });

      return updatedJob;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }
}