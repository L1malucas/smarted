export interface User {
  _id: string
  cpf: string
  slug: string // Hash do CPF para URLs seguras
  name: string
  email: string
  roles: string[]
  permissions: string[]
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date;
  status: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
}