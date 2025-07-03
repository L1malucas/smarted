import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  userId: string;
  userName: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  success: boolean;
  timestamp: Date;
}

const LogSchema: Schema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  actionType: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String },
  details: { type: String },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const Log = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);

export default Log;