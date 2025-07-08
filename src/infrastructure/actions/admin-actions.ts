"use server";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { IUser } from "@/domain/models/User";
import { IAllowedCPF } from "@/domain/models/AllowedCPF";
import { IAuditLog } from "@/domain/models/AuditLog";
import { getLogsCollection, getSystemSettingsCollection, getUsersCollection } from "../persistence/db";
import { ISystemSettings } from "@/domain/models/SystemSettings";
import { IActionResult } from "@/shared/types/types/action-interface";
import { createLoggedAction } from "@/shared/lib/action-builder";
/**
 * Lista todos os usuários do tenant atual.
 */
export const getTenantUsers = createLoggedAction<
  [],
  IUser[]
>({
  actionName: "Listar Usuários do Tenant",
  resourceType: "User",
  requireAuth: true,
  action: async ({ session }) => {
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({ tenantId: session.tenantId }).toArray();
    return JSON.parse(JSON.stringify(users));
  },
});
/**
 * Adiciona um novo usuário ao tenant atual.
 */
export const addUser = createLoggedAction<
  [Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'tenantId' | 'slug' | 'createdBy' | 'updatedBy'>],
  { success: boolean; user: IUser }
>({
  actionName: "Adicionar Usuário",
  resourceType: "User",
  requireAuth: true,
  action: async ({ session, args: [userData] }) => {
    const usersCollection = await getUsersCollection();
    const newUser: Omit<IUser, '_id'> = {
      ...userData,
      tenantId: session.tenantId,
      tenantName: session.tenantName,
      slug: userData.name.toLowerCase().replace(/\s+/g, '-'),
      status: 'active',
      createdBy: session.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: session.userId,
    };
    const result = await usersCollection.insertOne(newUser as any);
    revalidatePath("/[slug]/admin", "layout");
    const createdUser = { ...newUser, _id: result.insertedId };
    return { success: true, user: JSON.parse(JSON.stringify(createdUser)) };
  },
  getResourceId: (result) => result.user?._id?.toString(),
});
/**
 * Atualiza os dados de um usuário existente.
 */
export const updateUser = createLoggedAction<
  [string, Partial<IUser>],
  { success: boolean }
>({
  actionName: "Atualizar Usuário",
  resourceType: "User",
  requireAuth: true,
  action: async ({ session, args: [userIdToUpdate, updates] }) => {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToUpdate), tenantId: session.tenantId },
      { $set: { ...updates, updatedAt: new Date(), updatedBy: session.userId } }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Usuário não encontrado ou nenhuma alteração realizada.");
    }
    revalidatePath("/[slug]/admin", "layout");
    return { success: true };
  },
  getResourceId: (_, args) => args[0],
});
/**
 * Desativa um usuário.
 */
export const deactivateUser = createLoggedAction<
  [string],
  { success: boolean }
>({
  actionName: "Desativar Usuário",
  resourceType: "User",
  requireAuth: true,
  action: async ({ session, args: [userIdToDeactivate] }) => {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToDeactivate), tenantId: session.tenantId },
      { $set: { status: 'inactive', updatedAt: new Date(), updatedBy: session.userId } }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Usuário não encontrado.");
    }
    revalidatePath("/[slug]/admin", "layout");
    return { success: true };
  },
  getResourceId: (_, args) => args[0],
});
/**
 * Lista todos os CPFs autorizados (usuários ativos) do tenant.
 */
export const getAllowedCPFs = createLoggedAction<
  [],
  IAllowedCPF[]
>({
  actionName: "Listar CPFs Autorizados",
  resourceType: "User",
  requireAuth: true,
  action: async ({ session }) => {
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({ tenantId: session.tenantId, status: 'active' }).toArray();
    const allowedCPFs: IAllowedCPF[] = users.map(user => ({
      cpf: user.cpf,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    return JSON.parse(JSON.stringify(allowedCPFs));
  },
});
/**
 * Obtém os logs de auditoria com paginação.
 */
export const getAccessLogs = createLoggedAction<
  [Date, Date, number, number],
  { logs: IAuditLog[], totalPages: number, currentPage: number }
>({
  actionName: "Listar Logs de Auditoria",
  resourceType: "AuditLog",
  requireAuth: true,
  action: async ({ session, args: [startDate, endDate, page = 1, limit = 10] }) => {
    const logsCollection = await getLogsCollection();
    const query: { tenantId: string; timestamp?: { $gte?: Date; $lte?: Date } } = { tenantId: session.tenantId! };
    if (startDate) {
      query.timestamp = { ...query.timestamp, $gte: startDate };
    }
    if (endDate) {
      query.timestamp = { ...query.timestamp, $lte: endDate };
    }
    const totalLogs = await logsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / limit);
    const logs = await logsCollection.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    const accessLogs: IAuditLog[] = logs.map((log: any) => ({
      id: log._id.toString(),
      userId: log.userId,
      userName: log.userName,
      actionType: log.actionType,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      details: log.details,
      success: log.success,
      timestamp: log.timestamp,
    }));
    return { logs: JSON.parse(JSON.stringify(accessLogs)), totalPages, currentPage: page };
  },
});
/**
 * Obtém as configurações do sistema para o tenant atual.
 */
export const getSystemSettingsAction = createLoggedAction<
  [],
  { settings: ISystemSettings }
>({
  actionName: "Obter Configurações do Sistema",
  resourceType: "SystemSettings",
  requireAuth: true,
  action: async ({ session }) => {
    const settingsCollection = await getSystemSettingsCollection();
    let settings = await settingsCollection.findOne({ tenantId: session.tenantId });
    if (!settings) {
      const defaultSettings: Omit<ISystemSettings, '_id'> = {
        tenantId: session.tenantId!,
        maxUsersPerTenant: 10, 
        defaultLinkExpirationDays: 30,
        requirePasswordForPublicLinks: false,
        allowPublicLinkSharing: true,
        maxLinkViews: 0, 
      };
      const insertResult = await settingsCollection.insertOne(defaultSettings as any);
      settings = {
        _id: insertResult.insertedId.toString(),
        ...defaultSettings
      };
    }
    return { settings: JSON.parse(JSON.stringify(settings)) };
  },
  getResourceId: (result) => result.settings.tenantId,
});
/**
 * Atualiza as configurações do sistema para o tenant atual.
 */
export const updateSystemSettingsAction = createLoggedAction<
  [Partial<ISystemSettings>],
  { success: boolean }
>({
  actionName: "Atualizar Configurações do Sistema",
  resourceType: "SystemSettings",
  requireAuth: true,
  action: async ({ session, args: [updates] }) => {
    const settingsCollection = await getSystemSettingsCollection();
    const result = await settingsCollection.updateOne(
      { tenantId: session.tenantId },
      { $set: { ...updates, updatedAt: new Date() } },
      { upsert: true }
    );
    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      throw new Error("Nenhuma alteração realizada ou configurações não encontradas.");
    }
    revalidatePath("/[slug]/admin/settings", "layout");
    return { success: true };
  },
});