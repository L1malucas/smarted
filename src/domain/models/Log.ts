import { ObjectId } from 'mongodb';

export interface ILog {
  _id?: string; // MongoDB's default ID (represented as string in application)
  userId: string;
  userName: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  success: boolean;
  timestamp: Date;
}
