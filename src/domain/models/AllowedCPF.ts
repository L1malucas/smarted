import { IBaseEntity } from './base/BaseEntity';

/**
 * @interface IAllowedCPF
 * @description Represents a CPF that is allowed to register in the system.
 * @extends {IBaseEntity}
 */
export interface IAllowedCPF extends IBaseEntity {
  cpf: string;
  name: string;
  isAdmin: boolean;
  email: string;
}
