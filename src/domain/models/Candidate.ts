import { ObjectId } from 'mongodb';

export interface ICandidate {
  _id?: ObjectId; // MongoDB's default ID
  jobId: ObjectId;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  status: 'applied' | 'screening' | 'evaluated' | 'contacted' | 'rejected';
  matchScore?: number;
  answers?: Array<{ questionId: ObjectId; answer: string }>;
  createdAt: Date;
  updatedAt: Date;
}
