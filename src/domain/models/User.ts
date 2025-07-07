import { IBaseEntity } from './base/BaseEntity';

/**
 * @interface IUser
 * @description Represents a system user.
 * @extends {IBaseEntity}
 */
export interface IUser extends IBaseEntity {
  cpf: string;
  slug: string;
  name: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  status: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
}

/**
 * @interface IUserPayload
 * @description Payload structure for user authentication tokens.
 */
export interface IUserPayload {
  userId: string;
  cpf: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  tenantId: string;
}

/**
 * @interface IUserSession
 * @description Represents the structure of a user session.
 */
export interface IUserSession {
  userId: string;
  tenantId: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
}
