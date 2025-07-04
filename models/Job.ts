import { ObjectId } from 'mongodb';
import { ICompetency } from './Competency';
import { IJobQuestion } from './JobQuestion';
import { ICriteriaWeights } from './CriteriaWeights';
import { IStatusChangeLog } from './StatusChangeLog';
import { JobStatus } from '@/types/jobs-interface';

export interface IJob {
  _id?: ObjectId; // MongoDB's default ID
  slug: string;
  title: string;
  description: string;
  competencies: ICompetency[];
  questions: IJobQuestion[];
  isPCDExclusive: boolean;
  isReferralJob: boolean;
  criteriaWeights: ICriteriaWeights;
  status: JobStatus;
  candidatesCount: number;
  isDraft: boolean;
  createdBy: string;
  createdByName: string;
  tenantId: string; // Added tenantId
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
  createdAt: Date;
  updatedAt: Date;
}
