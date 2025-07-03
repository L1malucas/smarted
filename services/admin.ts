'use server';

import { z } from 'zod';
import { createUserSchema, updateUserSchema, systemSettingsSchema } from '@/lib/schemas/admin.schema';
import User from '@/models/User';
import SystemSettings, { ISystemSettings } from '@/models/SystemSettings';
import databasePromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { withActionLogging } from '@/lib/actions'; // Updated import
import { ActionLogConfig } from '@/types/action-interface'; // Import ActionLogConfig

// Placeholder for session management. In a real app, use NextAuth.js or similar.
// This function should return the current user's session data, including userId, tenantId, roles, and userName.
async function getSession() {
  // For now, returning a dummy session. Replace with actual session retrieval.
  return {
    userId: "superAdminUserId",
    tenantId: "superAdminTenantId",
    roles: ["super-admin"], // Only super-admin can manage system settings
    userName: "Super Admin User", // Added userName
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

  // Connect to database
  const db = await databasePromise;

  // 3. Business Logic: Create a new user
  const newUser = new User({
    ...validatedData,
    slug: validatedData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 9), // Simple slug generation
    isAdmin: validatedData.roles.includes("admin") || validatedData.roles.includes("super-admin"),
    permissions: [], // Permissions will be derived from roles or managed separately
  });

  await newUser.save();

  return { success: true, data: { userId: newUser._id.toString() } };
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

  // Connect to database
  const db = await databasePromise;

  // 3. Validate Tenancy and update user
  const updatedUser = await User.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(userId), tenantId: session.tenantId },
    { $set: validatedData },
    { new: true }
  );

  if (!updatedUser) {
    return { success: false, error: 'Usuário não encontrado ou você não tem permissão para atualizá-lo.' };
  }

  return { success: true, data: { userId: updatedUser._id.toString() } };
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

  // Connect to database
  const db = await databasePromise;

  // 2. Business Logic: Fetch system settings
  // Assuming there's only one system settings document, or we fetch the first one.
  const settings = await SystemSettings.findOne();

  if (!settings) {
    // If no settings exist, return default or create one
    const defaultSettings = new SystemSettings();
    await defaultSettings.save();
    return { success: true, data: { settings: defaultSettings.toObject() } };
  }

  return { success: true, data: { settings: settings.toObject() } };
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

  // Connect to database
  const db = await databasePromise;

  // 3. Business Logic: Update system settings
  // Assuming there's only one system settings document, or we update the first one found.
  const updatedSettings = await SystemSettings.findOneAndUpdate(
    {}, // Find any document (assuming singleton)
    { $set: validatedData },
    { new: true, upsert: true } // Create if not exists
  );

  if (!updatedSettings) {
    return { success: false, error: 'Não foi possível atualizar as configurações do sistema.' };
  }

  return { success: true, data: { settings: updatedSettings.toObject() } };
}

export const createUserAction = async (payload: z.infer<typeof createUserSchema>) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
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
    userId: session.userId,
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
    userId: session.userId,
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
    userId: session.userId,
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