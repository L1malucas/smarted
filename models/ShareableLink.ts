import mongoose, { Schema, Document } from 'mongoose';

export interface IShareableLink extends Document {
  hash: string;
  type: 'job' | 'report' | 'dashboard';
  resourceId: mongoose.Types.ObjectId;
  password?: string;
  expirationDate?: Date;
  createdAt: Date;
}

const ShareableLinkSchema: Schema = new Schema({
  hash: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['job', 'report', 'dashboard'] },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  password: { type: String },
  expirationDate: { type: Date },
}, { timestamps: true });

const ShareableLink = mongoose.models.ShareableLink || mongoose.model<IShareableLink>('ShareableLink', ShareableLinkSchema);

export default ShareableLink;
