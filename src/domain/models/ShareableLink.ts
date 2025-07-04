import { ObjectId } from 'mongodb';

export interface IShareableLink {
  _id?: ObjectId; // MongoDB's default ID
  hash: string;
  type: 'job' | 'report' | 'dashboard';
  resourceId: ObjectId;
  password?: string;
  expirationDate?: Date;
  createdAt: Date;
}
