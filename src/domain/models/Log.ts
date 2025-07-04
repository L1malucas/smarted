import { ObjectId } from 'mongodb';

export interface ILog {
  _id?: ObjectId; // MongoDB's default ID
  userId: string;
  userName: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  success: boolean;
  timestamp: Date;
}
