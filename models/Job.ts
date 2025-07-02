import mongoose, { Schema, Document } from 'mongoose';
import CompetencySchema from './Competency';
import JobQuestionSchema from './JobQuestion';
import CriteriaWeightsSchema from './CriteriaWeights';
import StatusChangeLogSchema from './StatusChangeLog';
import { JobStatus } from '@/types/jobs-interface';

export interface IJob extends Document {
  slug: string;
  title: string;
  description: string;
  competencies: mongoose.Types.DocumentArray<typeof CompetencySchema>;
  questions: mongoose.Types.DocumentArray<typeof JobQuestionSchema>;
  isPCDExclusive: boolean;
  isReferralJob: boolean;
  criteriaWeights: typeof CriteriaWeightsSchema;
  status: JobStatus;
  candidatesCount: number;
  isDraft: boolean;
  createdBy: string;
  createdByName: string;
  lastStatusUpdateBy?: string;
  lastStatusUpdateByName?: string;
  statusChangeLog?: mongoose.Types.DocumentArray<typeof StatusChangeLogSchema>;
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

const JobSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  competencies: { type: [CompetencySchema], default: [] },
  questions: { type: [JobQuestionSchema], default: [] },
  isPCDExclusive: { type: Boolean, default: false },
  isReferralJob: { type: Boolean, default: false },
  criteriaWeights: { type: CriteriaWeightsSchema, required: true },
  status: { type: String, required: true, enum: ["draft", "aberta", "pausada", "fechada", "cancelada"] },
  candidatesCount: { type: Number, default: 0 },
  isDraft: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdByName: { type: String, required: true },
  lastStatusUpdateBy: { type: String },
  lastStatusUpdateByName: { type: String },
  statusChangeLog: { type: [StatusChangeLogSchema], default: [] },
  department: { type: String },
  location: { type: String },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String },
  },
  employmentType: { type: String, enum: ["full_time", "part_time", "contract", "internship"] },
  experienceLevel: { type: String, enum: ["junior", "mid", "senior", "lead"] },
  tags: { type: [String] },
  publishedAt: { type: Date },
  closingDate: { type: Date },
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;