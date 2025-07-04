import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId; // MongoDB's default ID
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
  status: 'active' | 'inactive';
  createdBy?: string; // userId of the creator
  updatedBy?: string; // userId of the last updater
}

