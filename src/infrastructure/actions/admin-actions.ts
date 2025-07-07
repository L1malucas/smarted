"use server";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { IUser } from "@/domain/models/User";
import { withActionLogging } from "@/shared/lib/actions";
import { IActionLogConfig } from "@/shared/types/types/action-interface";
import { IAllowedCPF } from "@/domain/models/AllowedCPF";
import { IAuditLog } from "@/domain/models/AuditLog";
import { getUsersCollection, getLogsCollection, getSystemSettingsCollection } from "../persistence/db";
import { ISystemSettings } from "@/domain/models/SystemSettings";
import { IActionResult } from "@/shared/types/types/action-interface";

async function getCurrentUser(): Promise<{ userId: string; tenantId: string; userName: string }> {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" }) as IUser;
  if (!user) throw new Error("Authenticated user not found.");
  return {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    userName: user.name
  };
}
export async function getTenantUsers(): Promise<IUser[]> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar Usuários",
    resourceType: "User",
    resourceId: session.tenantId,
    success: false
  };
  const getTenantUsersInternal = async () => {
    const { tenantId } = await getCurrentUser();
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({ tenantId }).toArray();
    return JSON.parse(JSON.stringify(users));
  };
  const actionResult = await withActionLogging(getTenantUsersInternal, logConfig)();
  return actionResult.data;
}
export async function addUser(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'tenantId' | 'slug'>) {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Adicionar Usuário",
    resourceType: "User",
    resourceId: "",
    success: false
  };
  const addUserInternal = async (userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'tenantId' | 'slug'>) => {
    const { userId, tenantId } = await getCurrentUser();
    const usersCollection = await getUsersCollection();
    const newUser: Omit<IUser, '_id'> = {
      ...userData,
      tenantId,
      slug: userData.name.toLowerCase().replace(/\s+/g, '-'),
      status: 'active',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: userId,
    };
    await usersCollection.insertOne(newUser);
    revalidatePath("/admin/users");
    return { success: true, user: JSON.parse(JSON.stringify(newUser)) };
  };
  const result = await withActionLogging(addUserInternal, logConfig)(userData);
  if (result.success && result.user) {
    logConfig.resourceId = result.user._id.toString();
  }
  return result;
}
export async function updateUser(userIdToUpdate: string, updates: Partial<IUser>) {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Atualizar Usuário",
    resourceType: "User",
    resourceId: userIdToUpdate,
    success: false
  };
  const updateUserInternal = async (userIdToUpdate: string, updates: Partial<IUser>) => {
    const { userId } = await getCurrentUser();
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToUpdate) },
      { $set: { ...updates, updatedAt: new Date(), updatedBy: userId } }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Usuário não encontrado ou nenhuma alteração realizada.");
    }
    revalidatePath("/admin/users");
    return { success: true };
  };
  return await withActionLogging(updateUserInternal, logConfig)(userIdToUpdate, updates);
}
export async function deactivateUser(userIdToDeactivate: string) {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Desativar Usuário",
    resourceType: "User",
    resourceId: userIdToDeactivate,
    success: false
  };
  const deactivateUserInternal = async (userIdToDeactivate: string) => {
    const { userId } = await getCurrentUser();
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToDeactivate) },
      { $set: { status: 'inactive', updatedAt: new Date(), updatedBy: userId } }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Usuário não encontrado.");
    }
    revalidatePath("/admin/users");
    return { success: true };
  };
  return await withActionLogging(deactivateUserInternal, logConfig)(userIdToDeactivate);
}
export async function getAllowedCPFs(): Promise<IAllowedCPF[]> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar CPFs Autorizados",
    resourceType: "User",
    resourceId: session.tenantId,
    success: false
  };
  const getAllowedCPFsInternal = async () => {
    const { tenantId } = await getCurrentUser();
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({ tenantId, status: 'active' }).toArray();
    const allowedCPFs: IAllowedCPF[] = users.map(user => ({
      cpf: user.cpf,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    return JSON.parse(JSON.stringify(allowedCPFs));
  };
  const result = await withActionLogging(getAllowedCPFsInternal, logConfig)();
  return result.data;
}
export async function getAccessLogs(startDate?: Date, endDate?: Date, page: number = 1, limit: number = 10): Promise<{ logs: AccessLog[], totalPages: number, currentPage: number }> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar Logs de Auditoria",
    resourceType: "AuditLog",
    resourceId: session.tenantId,
    success: false
  };
  const getAccessLogsInternal = async (startDate?: Date, endDate?: Date, page: number = 1, limit: number = 10) => {
    const { tenantId } = await getCurrentUser();
    const logsCollection = await getLogsCollection();
    const query: { tenantId: string; timestamp?: { $gte?: Date; $lte?: Date } } = { tenantId };
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
    const accessLogs: IAuditLog[] = logs.map(log => ({
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
  };
  const result = await withActionLogging(getAccessLogsInternal, logConfig)(startDate, endDate, page, limit);
  if (!result.data) {
    return { logs: [], totalPages: 0, currentPage: page };
  }
  return result.data;
}

export async function getSystemSettingsAction(): Promise<IActionResult<{ settings: ISystemSettings }>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Configurações do Sistema",
    resourceType: "SystemSettings",
    resourceId: session.tenantId,
    success: false
  };

  const getSystemSettingsInternal = async () => {
    const { tenantId } = await getCurrentUser();
    const settingsCollection = await getSystemSettingsCollection();
    let settings = await settingsCollection.findOne({ tenantId }) as ISystemSettings;

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings: ISystemSettings = {
        tenantId,
        maxUsersPerTenant: 10, // Default value
        defaultLinkExpirationDays: 30,
        requirePasswordForPublicLinks: false,
        allowPublicLinkSharing: true,
        maxLinkViews: 0, // 0 means unlimited
      };
      await settingsCollection.insertOne(defaultSettings);
      settings = defaultSettings;
    }
    return { settings: JSON.parse(JSON.stringify(settings)) };
  };

  return await withActionLogging(getSystemSettingsInternal, logConfig)();
}

export async function updateSystemSettingsAction(updates: Partial<ISystemSettings>): Promise<IActionResult<void>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Atualizar Configurações do Sistema",
    resourceType: "SystemSettings",
    resourceId: session.tenantId,
    success: false
  };

  const updateSystemSettingsInternal = async (updates: Partial<ISystemSettings>) => {
    const { tenantId } = await getCurrentUser();
    const settingsCollection = await getSystemSettingsCollection();
    const result = await settingsCollection.updateOne(
      { tenantId },
      { $set: { ...updates, updatedAt: new Date() } },
      { upsert: true } // Create if not exists
    );

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      throw new Error("Nenhuma alteração realizada ou configurações não encontradas.");
    }
    revalidatePath("/admin/settings"); // Adjust path as needed
    return { success: true };
  };

  return await withActionLogging(updateSystemSettingsInternal, logConfig)(updates);
}
