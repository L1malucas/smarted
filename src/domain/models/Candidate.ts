import { IBaseEntity } from './base/BaseEntity';

/**
 * @interface ICandidate
 * @description Represents a candidate who applied for a job.
 * @extends {IBaseEntity}
 */
export interface ICandidate extends IBaseEntity {
  jobId: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  status: 'applied' | 'screening' | 'evaluated' | 'contacted' | 'rejected';
  matchScore?: number;
  answers?: Array<{ questionId: string; answer: string }>;
}
