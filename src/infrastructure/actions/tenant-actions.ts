"use server";

import { getTenantsCollection } from '@/infrastructure/persistence/db';
import { ITenant } from '@/domain/models/Tenant';
import { withActionLogging } from '@/shared/lib/actions';
import { auth } from '@/infrastructure/auth/auth';
import { ObjectId } from 'mongodb';

export const createTenant = withActionLogging(
  async (tenantData: { name: string; slug: string; cnpj?: string; email?: string; officialWebsite?: string; brazilianState?: string; responsibleName?: string; }) => {
    const session = await auth();

    if (!session || !session.user || !session.user.roles.includes('super-admin')) {
      throw new Error('Unauthorized: Only super-admins can create tenants.');
    }

    const tenantsCollection = await getTenantsCollection();

    // Check if a tenant with the same slug already exists
    const existingTenant = await tenantsCollection.findOne({ slug: tenantData.slug });
    if (existingTenant) {
      throw new Error('Tenant with this slug already exists.');
    }

    const newTenant: ITenant = {
      name: tenantData.name,
      slug: tenantData.slug,
      cnpj: tenantData.cnpj,
      email: tenantData.email,
      officialWebsite: tenantData.officialWebsite,
      brazilianState: tenantData.brazilianState,
      responsibleName: tenantData.responsibleName,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(session.user.id),
      createdByName: session.user.name || 'Unknown',
    };

    const result = await tenantsCollection.insertOne(newTenant);

    return { success: true, tenantId: result.insertedId.toHexString() };
  },
  "Criar Tenant",
  "Tenant",
  "",
  ""
);