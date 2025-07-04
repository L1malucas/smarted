import { ObjectId } from 'mongodb';

export interface ISystemSettings {
  _id?: ObjectId; // MongoDB's default ID
  maxUsersPerTenant: number;
  // Add other system-wide settings here
}
