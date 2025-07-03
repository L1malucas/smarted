import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  jobId: mongoose.Types.ObjectId;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  status: 'applied' | 'screening' | 'evaluated' | 'contacted' | 'rejected';
  matchScore?: number;
  answers?: Array<{ questionId: mongoose.Types.ObjectId; answer: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema = new Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  resumeUrl: { type: String, required: true },
  status: { type: String, enum: ['applied', 'screening', 'evaluated', 'contacted', 'rejected'], default: 'applied' },
  matchScore: { type: Number },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answer: { type: String, required: true },
  }],
}, { timestamps: true });

const Candidate = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);

export default Candidate;
