import { JobStatus } from '@/types/jobs-interface';

export interface IStatusChangeLog {
  status: JobStatus;
  changedAt: Date;
  changedBy: string;
  changedByName?: string;
}
