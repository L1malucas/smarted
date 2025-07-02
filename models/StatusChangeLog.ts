import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus } from '@/types/jobs-interface';

export interface IStatusChangeLog extends Document {
  status: JobStatus;
  changedAt: Date;
  changedBy: string;
  changedByName?: string;
}

const StatusChangeLogSchema: Schema = new Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, required: true, default: Date.now },
  changedBy: { type: String, required: true },
  changedByName: { type: String },
});

export default StatusChangeLogSchema;