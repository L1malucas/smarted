import { ObjectId } from 'mongodb';
import { IBaseEntity } from './base/BaseEntity';

export interface ITenant extends IBaseEntity {
  _id?: ObjectId;
  name: string;
  slug: string;
  cnpj?: string;
  email?: string;
  officialWebsite?: string;
  brazilianState?: string;
  responsibleName?: string;
}
