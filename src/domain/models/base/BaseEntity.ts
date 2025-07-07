import { ObjectId } from 'mongodb';

/**
 * @interface IBaseEntity
 * @description Base interface for all database models, providing common fields.
 */
export interface IBaseEntity {
  _id?: ObjectId; // MongoDB's default ID (represented as string in application)
  createdAt: Date;
  updatedAt: Date;
}
