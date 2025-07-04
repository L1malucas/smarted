'use server';

import { z } from 'zod';
import { createUserSchema, updateUserSchema, systemSettingsSchema } from '@/lib/schemas/admin.schema';
import { IUser } from '@/models/User';
import { ISystemSettings } from '@/models/SystemSettings';
import { getUsersCollection, getSystemSettingsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withActionLogging } from '@/lib/actions'; // Updated import
import { ActionLogConfig } from '@/types/action-interface'; // Import ActionLogConfig
import { generateSlug } from '@/lib/utils';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function getSession() {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) {
    return {
      userId: null,
      tenantId: null,
      roles: [],
      userName: "Unknown User",
    };
  }
  try {
    const decoded = await verifyToken(accessToken);
    if (decoded) {
      return {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        roles: decoded.roles,
        userName: decoded.name || "Unknown User",
      };
    }
  } catch (error) {
    console.error("Error getting session in admin service:", error);
  }
  return {
    userId: null,
    tenantId: null,
    roles: [],
    userName: "Unknown User",
  };
}

async function createUserActionInternal(payload: z.infer<typeof createUserSchema>) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Crucial: Only super-admin can create users
  if (!session.roles.includes("super-admin")) {
    return { success: false, error: 'Você não tem permissão para criar usuários.' };
  }

  // 2. Validate payload using Zod schema
  const validatedData = createUserSchema.parse(payload);

  const usersCollection = await getUsersCollection();

  // 3. Business Logic: Create a new user
  const newUser: IUser = {
    ...validatedData,
    slug: generateSlug(validatedData.name),
    isAdmin: validatedData.roles.includes("admin") || validatedData.roles.includes("super-admin"),
    permissions: [], // Permissions will be derived from roles or managed separately
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);

  return { success: true, data: { userId: result.insertedId.toString() } };
}

async function updateUserActionInternal(userId: string, payload: z.infer<typeof updateUserSchema>) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Crucial: Only super-admin can update users, or a user can update their own profile
  const canUpdateAllUsers = session.roles.includes("super-admin");
  const isUpdatingSelf = session.userId === userId;

  if (!canUpdateAllUsers && !isUpdatingSelf) {
    return { success: false, error: 'Você não tem permissão para atualizar este usuário.' };
  }

  // 2. Validate payload using Zod schema
  const validatedData = updateUserSchema.parse(payload);

  const usersCollection = await getUsersCollection();

  // 3. Validate Tenancy and update user
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(userId), tenantId: session.tenantId },
    { $set: { ...validatedData, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return { success: false, error: 'Usuário não encontrado ou você não tem permissão para atualizá-lo.' };
  }

  return { success: true, data: { userId: userId } };
}

async function getSystemSettingsActionInternal() {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Crucial: Access restricted to super-admin
  if (!session.roles.includes("super-admin")) {
    return { success: false, error: 'Você não tem permissão para visualizar as configurações do sistema.' };
  }

  const systemSettingsCollection = await getSystemSettingsCollection();

  // 2. Business Logic: Fetch system settings
  // Assuming there's only one system settings document, or we fetch the first one.
  let settings = await systemSettingsCollection.findOne({}) as ISystemSettings;

  if (!settings) {
    // If no settings exist, return default or create one
    const defaultSettings: ISystemSettings = {
      maxUsersPerTenant: 3,
      // Add other default system-wide settings here
    };
    const result = await systemSettingsCollection.insertOne(defaultSettings);
    settings = { ...defaultSettings, _id: result.insertedId };
  }

  return { success: true, data: { settings: settings } };
}

async function updateSystemSettingsActionInternal(payload: z.infer<typeof systemSettingsSchema>) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Crucial: Access restricted to super-admin
  if (!session.roles.includes("super-admin")) {
    return { success: false, error: 'Você não tem permissão para atualizar as configurações do sistema.' };
  }

  // 2. Validate payload using Zod schema
  const validatedData = systemSettingsSchema.parse(payload);

  const systemSettingsCollection = await getSystemSettingsCollection();

  // 3. Business Logic: Update system settings
  // Assuming there's only one system settings document, or we update the first one found.
  const result = await systemSettingsCollection.updateOne(
    {}, // Find any document (assuming singleton)
    { $set: { ...validatedData } },
    { upsert: true } // Create if not exists
  );

  if (result.matchedCount === 0 && result.upsertedCount === 0) {
    return { success: false, error: 'Não foi possível atualizar as configurações do sistema.' };
  }

  const updatedSettings = await systemSettingsCollection.findOne({}) as ISystemSettings;

  return { success: true, data: { settings: updatedSettings } };
}

export const createUserAction = async (payload: z.infer<typeof createUserSchema>) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId ?? "",
    userName: session.userName,
    actionType: "Criar Usuário",
    resourceType: "User",
    resourceId: "", // Will be populated after creation
    successMessage: "Usuário criado com sucesso!",
    errorMessage: "Erro ao criar usuário.",
  };
  const wrappedAction = withActionLogging(createUserActionInternal, logConfig);
  const result = await wrappedAction(payload);
  if (result.success && result.data && result.data.userId) {
    logConfig.resourceId = result.data.userId;
  }
  return result;
};

export const updateUserAction = async (userId: string, payload: z.infer<typeof updateUserSchema>) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId ?? "",
    userName: session.userName,
    actionType: "Atualizar Usuário",
    resourceType: "User",
    resourceId: userId,
    successMessage: "Usuário atualizado com sucesso!",
    errorMessage: "Erro ao atualizar usuário.",
  };
  const wrappedAction = withActionLogging(updateUserActionInternal, logConfig);
  return await wrappedAction(userId, payload);
};

export const getSystemSettingsAction = async () => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId ?? "",
    userName: session.userName,
    actionType: "Obter Configurações do Sistema",
    resourceType: "SystemSettings",
    resourceId: "global", // Assuming a single global settings document
    successMessage: "Configurações do sistema obtidas com sucesso!",
    errorMessage: "Erro ao obter configurações do sistema.",
  };
  const wrappedAction = withActionLogging(getSystemSettingsActionInternal, logConfig);
  return await wrappedAction();
};

export const updateSystemSettingsAction = async (payload: z.infer<typeof systemSettingsSchema>) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId ?? "",
    userName: session.userName,
    actionType: "Atualizar Configurações do Sistema",
    resourceType: "SystemSettings",
    resourceId: "global", // Assuming a single global settings document
    successMessage: "Configurações do sistema atualizadas com sucesso!",
    errorMessage: "Erro ao atualizar configurações do sistema.",
  };
  const wrappedAction = withActionLogging(updateSystemSettingsActionInternal, logConfig);
  return await wrappedAction(payload);
};