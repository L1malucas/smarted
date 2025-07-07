import { IBaseEntity } from "./base/BaseEntity";

export interface IShareableLink extends Pick<IBaseEntity, '_id' | 'createdAt'> {
  hash: string;
  type: 'job' | 'report' | 'dashboard';
  resourceId: string;
  password?: string;
  expirationDate?: Date;
}