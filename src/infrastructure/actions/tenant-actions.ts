
"use server";

import { ObjectId } from 'mongodb';
import { getTenantsCollection } from '@/infrastructure/persistence/db';
import { ITenant } from '@/domain/models/Tenant';
import { createLoggedAction } from '@/shared/lib/action-builder';

/**
 * Cria um novo tenant.
 * Apenas super-admins podem executar esta ação.
 */
export const createTenant = createLoggedAction<
  [Omit<ITenant, '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName'>],
  { success: boolean; tenantId: string }
>({
  actionName: "Criar Tenant",
  resourceType: "Tenant",
  requireAuth: true,
  action: async ({ session, args: [tenantData] }) => {
    // Validação de permissão dentro da action
    if (!session.roles.includes('super-admin')) {
      throw new Error('Não autorizado: Apenas super-admins podem criar tenants.');
    }

    const tenantsCollection = await getTenantsCollection();

    const existingTenant = await tenantsCollection.findOne({ slug: tenantData.slug });
    if (existingTenant) {
      throw new Error('Já existe um tenant com este slug.');
    }

    const newTenant: Omit<ITenant, '_id'> = {
      ...tenantData,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(session.userId),
      createdByName: session.name,
    };

    const result = await tenantsCollection.insertOne(newTenant as any);

    return { success: true, tenantId: result.insertedId.toHexString() };
  },
  getResourceId: (result) => result.tenantId,
});
