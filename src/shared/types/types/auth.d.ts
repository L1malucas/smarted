export interface IUserPayload {
  userId: string;
  cpf: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  tenantId: string;
  tenantName: string;
}