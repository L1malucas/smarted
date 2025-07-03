import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  cpf: string;
  slug: string;
  name: string;
  email: string;
  tenantId: string; // Added tenantId
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  cpf: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true }, // Added tenantId to schema
  roles: { type: [String], default: ['recruiter'] },
  permissions: { type: [String], default: [] },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
