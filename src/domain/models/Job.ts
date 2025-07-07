import { IBaseEntity } from './base/BaseEntity';
import { ICompetency } from './Competency';
import { IJobQuestion } from './JobQuestion';
import { ICriteriaWeights } from './CriteriaWeights';
import { IStatusChangeLog } from './StatusChangeLog';
import { IJobStatus } from './JobStatus';

/**
 * @interface IJob
 * @description Represents a job posting.
 * @extends {IBaseEntity}
 */
export interface IJob extends IBaseEntity {
  slug: string;
  title: string;
  description: string;
  competencies: ICompetency[];
  questions: IJobQuestion[];
  isPCDExclusive: boolean;
  isReferralJob: boolean;
  criteriaWeights: ICriteriaWeights;
  status: IJobStatus;
  candidatesCount: number;
  isDraft: boolean;
  createdBy: string;
  createdByName: string;
  lastStatusUpdateBy?: string;
  lastStatusUpdateByName?: string;
  statusChangeLog?: IStatusChangeLog[];
  department?: string;
  location?: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType?: "full_time" | "part_time" | "contract" | "internship";
  experienceLevel?: "junior" | "mid" | "senior" | "lead";
  tags?: string[];
  publishedAt?: Date;
  closingDate?: Date;
}