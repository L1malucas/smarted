import { v4 as uuidv4 } from 'uuid';
import { Job, JobStatus } from '@/types/jobs-interface';

// In a real application, this would be a database or API call
let mockJobs: Job[] = [
  {
    _id: "1",
    slug: "dev-frontend",
    title: "Desenvolvedor Frontend Sênior",
    description: "Buscamos um desenvolvedor frontend experiente para liderar projetos em React e TypeScript...",
    status: "recrutamento",
    candidatesCount: 23,
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-05-20"),
    createdBy: "joao-silva-abc123",
    createdByName: "João Silva",
    competencies: [],
    questions: [],
    isPCDExclusive: false,
    isReferralJob: false,
    criteriaWeights: { experience: 30, skills: 30, certifications: 15, behavioral: 15, leadership: 10 },
    statusChangeLog: [
      {
        status: "aberta",
        changedAt: new Date("2024-05-15"),
        changedBy: "joao-silva-abc123",
        changedByName: "João Silva",
      },
      {
        status: "recrutamento",
        changedAt: new Date("2024-05-20"),
        changedBy: "joao-silva-abc123",
        changedByName: "João Silva",
      },
    ],
  },
  {
    _id: "2",
    slug: "ux-designer",
    title: "UX/UI Designer Pleno",
    description: "Procuramos um designer com experiência em Figma e prototipagem...",
    status: "triagem",
    candidatesCount: 15,
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-05"),
    createdBy: "maria-santos-xyz456",
    createdByName: "Maria Santos",
    competencies: [],
    questions: [],
    isPCDExclusive: false,
    isReferralJob: false,
    criteriaWeights: { experience: 20, skills: 40, certifications: 10, behavioral: 20, leadership: 10 },
    statusChangeLog: [
      {
        status: "aberta",
        changedAt: new Date("2024-06-01"),
        changedBy: "maria-santos-xyz456",
        changedByName: "Maria Santos",
      },
      {
        status: "triagem",
        changedAt: new Date("2024-06-05"),
        changedBy: "maria-santos-xyz456",
        changedByName: "Maria Santos",
      },
    ],
  },
];

export class JobService {
  static async saveJob(job: Omit<Job, '_id' | 'createdAt' | 'updatedAt' | 'candidatesCount'>): Promise<Job> {
    try {
      const newJob: Job = {
        ...job,
        _id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        candidatesCount: 0,
        isDraft: job.isDraft ?? true,
      };

      mockJobs.push(newJob);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      return newJob;
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  static async updateJob(jobId: string, updates: Partial<Job>, userId: string, userName: string): Promise<Job> {
    try {
      const jobIndex = mockJobs.findIndex(job => job._id === jobId);
      if (jobIndex === -1) {
        throw new Error('Job not found');
      }

      const existingJob = mockJobs[jobIndex];
      const updatedJob = {
        ...existingJob,
        ...updates,
        updatedAt: new Date(),
      };

      mockJobs[jobIndex] = updatedJob;
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  static async getAllJobs(tenantSlug?: string): Promise<Job[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // In a real app, you would filter by tenantSlug here
    return mockJobs.filter(job => !job.isDraft)
  }

  static async getJobById(jobId: string): Promise<Job | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockJobs.find(job => job._id === jobId) || null;
  }

  static async updateJobStatus(jobId: string, newStatus: JobStatus, userId: string, userName: string): Promise<Job> {
    try {
      const jobIndex = mockJobs.findIndex(job => job._id === jobId);
      if (jobIndex === -1) {
        throw new Error('Job not found');
      }

      const job = mockJobs[jobIndex];
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

      mockJobs[jobIndex] = updatedJob;
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      return updatedJob;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }
}