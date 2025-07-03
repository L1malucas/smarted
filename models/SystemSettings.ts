import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  maxUsersPerTenant: number;
  // Add other system-wide settings here
}

const SystemSettingsSchema: Schema = new Schema({
  maxUsersPerTenant: { type: Number, default: 3 },
  // Add other system-wide settings here
});

const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
