"use server";

import { z } from 'zod';
import { createUserSchema, updateUserSchema, systemSettingsSchema } from '@/application/schemas/admin.schema';
import { IUser } from '@/domain/models/User';
import { ISystemSettings } from '@/domain/models/SystemSettings';
import { getUsersCollection, getSystemSettingsCollection } from '@/infrastructure/persistence/db';
import { ObjectId } from 'mongodb';
import { generateSlug } from '@/shared/lib/utils';

export class AdminService {

  static async createUser(session: UserSession, payload: z.infer<typeof createUserSchema>) {
    if (!session || !session.userId || !session.tenantId) {
      throw new Error('Usuário não autenticado ou sessão inválida.');
    }

    if (!session.roles.includes("super-admin")) {
      throw new Error('Você não tem permissão para criar usuários.');
    }

    const validatedData = createUserSchema.parse(payload);
    const usersCollection = await getUsersCollection();

    const newUser: IUser = {
      ...validatedData,
      slug: generateSlug(validatedData.name),
      isAdmin: validatedData.roles.includes("admin") || validatedData.roles.includes("super-admin"),
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      createdBy: session.userId,
      updatedBy: session.userId,
    };

    const result = await usersCollection.insertOne(newUser);
    return { success: true, data: { userId: result.insertedId.toString() } };
  }

  static async updateUser(session: UserSession, userIdToUpdate: string, updates: Partial<IUser>) {
    if (!session || !session.userId || !session.tenantId) {
      throw new Error('Usuário não autenticado ou sessão inválida.');
    }

    const canUpdateAllUsers = session.roles.includes("super-admin");
    const isUpdatingSelf = session.userId === userIdToUpdate;

    if (!canUpdateAllUsers && !isUpdatingSelf) {
      throw new Error('Você não tem permissão para atualizar este usuário.');
    }

    const validatedData = updateUserSchema.parse(updates);
    const usersCollection = await getUsersCollection();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToUpdate), tenantId: session.tenantId },
      { $set: { ...validatedData, updatedAt: new Date(), updatedBy: session.userId } }
    );

    if (result.matchedCount === 0) {
      throw new Error('Usuário não encontrado ou nenhuma alteração realizada.');
    }

    return { success: true, data: { userId: userIdToUpdate } };
  }

  static async getSystemSettings(session: UserSession) {
    if (!session || !session.userId || !session.tenantId) {
      throw new Error('Usuário não autenticado ou sessão inválida.');
    }

    if (!session.roles.includes("super-admin")) {
      throw new Error('Você não tem permissão para visualizar as configurações do sistema.');
    }

    const systemSettingsCollection = await getSystemSettingsCollection();
    let settings = await systemSettingsCollection.findOne({}) as ISystemSettings;

    if (!settings) {
      const defaultSettings: ISystemSettings = {
        maxUsersPerTenant: 3,
      };
      const result = await systemSettingsCollection.insertOne(defaultSettings);
      settings = { ...defaultSettings, _id: result.insertedId };
    }

    return { success: true, data: { settings: settings } };
  }

  static async updateSystemSettings(session: UserSession, payload: z.infer<typeof systemSettingsSchema>) {
    if (!session || !session.userId || !session.tenantId) {
      throw new Error('Usuário não autenticado ou sessão inválida.');
    }

    if (!session.roles.includes("super-admin")) {
      throw new Error('Você não tem permissão para atualizar as configurações do sistema.');
    }

    const validatedData = systemSettingsSchema.parse(payload);
    const systemSettingsCollection = await getSystemSettingsCollection();

    const result = await systemSettingsCollection.updateOne(
      {}, 
      { $set: { ...validatedData } },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      throw new Error('Não foi possível atualizar as configurações do sistema.');
    }

    const updatedSettings = await systemSettingsCollection.findOne({}) as ISystemSettings;

    return { success: true, data: { settings: updatedSettings } };
  }
}
