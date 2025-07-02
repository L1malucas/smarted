import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  acao: string;
  usuarioCpf?: string;
  role?: string;
  timestamp: Date;
  detalhes?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const LogSchema: Schema = new Schema({
  acao: { type: String, required: true },
  usuarioCpf: { type: String },
  role: { type: String },
  timestamp: { type: Date, required: true, default: Date.now },
  detalhes: { type: Object },
}, { timestamps: true });

const Log = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);

export default Log;
