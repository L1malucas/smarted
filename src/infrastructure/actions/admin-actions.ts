"use server";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { IUser } from "@/domain/models/User";
import { withActionLogging } from "@/shared/lib/actions";
import { IActionLogConfig } from "@/shared/types/types/action-interface";
import { IAllowedCPF } from "@/domain/models/AllowedCPF";
import { IAuditLog } from "@/domain/models/AuditLog";
import { getUsersCollection, getLogsCollection, getSystemSettingsCollection } from "../persistence/db";
import { getSessionUser } from "./auth-actions";
import { ISystemSettings } from "@/domain/models/SystemSettings";
import { IActionResult } from "@/shared/types/types/action-interface";


export async function getTenantUsers(): Promise<IUser[]> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized: No active session.");
  }
  const getTenantUsersInternal = async () => {
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({ tenantId: session.tenantId }).toArray();
    return JSON.parse(JSON.stringify(users));
  };
  const actionResult = await withActionLogging(
    getTenantUsersInternal,
    "Listar Usuários",
    "User",
    session.tenantId,
    ""
  )();
  return actionResult.data;
}
export async function addUser(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'tenantId' | 'slug' | 'createdBy' | 'updatedBy'>) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized: No active session.");
  }
  const addUserInternal = async (userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'tenantId' | 'slug' | 'createdBy' | 'updatedBy' | 'tenantName'>) => {
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
    await usersCollection.insertOne(newUser);
    revalidatePath("/admin/users");
    return { success: true, user: JSON.parse(JSON.stringify(newUser)) };
  };
  const result = await withActionLogging(
    addUserInternal,
    "Adicionar Usuário",
    "User",
    "",
    ""
  )(userData);
  if (result.success && result.user) {
    // logConfig.resourceId = result.user._id.toString(); // This line is no longer needed here
  }
  return result;
}
export async function updateUser(userIdToUpdate: string, updates: Partial<IUser>) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized: No active session.");
  }
  const updateUserInternal = async (userIdToUpdate: string, updates: Partial<IUser>) => {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToUpdate), tenantId: session.tenantId },
      { $set: { ...updates, updatedAt: new Date(), updatedBy: session.userId } }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Usuário não encontrado ou nenhuma alteração realizada.");
    }
    revalidatePath("/admin/users");
    return { success: true };
  };
  return await withActionLogging(
    updateUserInternal,
    "Atualizar Usuário",
    "User",
    userIdToUpdate,
    ""
  )(userIdToUpdate, updates);
}
export async function deactivateUser(userIdToDeactivate: string) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized: No active session.");
  }
  const deactivateUserInternal = async (userIdToDeactivate: string) => {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToDeactivate), tenantId: session.tenantId },
      { $set: { status: 'inactive', updatedAt: new Date(), updatedBy: session.userId } }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Usuário não encontrado.");
    }
    revalidatePath("/admin/users");
    return { success: true };
  };
  return await withActionLogging(
    deactivateUserInternal,
    "Desativar Usuário",
    "User",
    userIdToDeactivate,
    ""
  )(userIdToDeactivate);
}
export async function getAllowedCPFs(): Promise<IAllowedCPF[]> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized: No active session.");
  }
  const getAllowedCPFsInternal = async () => {
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
  };
  const result = await withActionLogging(
    getAllowedCPFsInternal,
    "Listar CPFs Autorizados",
    "User",
    session.tenantId,
    ""
  )();
  return result.data;
}
export async function getAccessLogs(startDate?: Date, endDate?: Date, page: number = 1, limit: number = 10): Promise<{ logs: AccessLog[], totalPages: number, currentPage: number }> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized: No active session.");
  }
  const getAccessLogsInternal = async (startDate?: Date, endDate?: Date, page: number = 1, limit: number = 10) => {
    const logsCollection = await getLogsCollection();
    const query: { tenantId: string; timestamp?: { $gte?: Date; $lte?: Date } } = { tenantId: session.tenantId };
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
  const result = await withActionLogging(
    getAccessLogsInternal,
    "Listar Logs de Auditoria",
    "AuditLog",
    session.tenantId,
    ""
  )(startDate, endDate, page, limit);
  if (!result.data) {
    return { logs: [], totalPages: 0, currentPage: page };
  }
  return result.data;
}

export async function getSystemSettingsAction(): Promise<IActionResult<{ settings: ISystemSettings }>> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized: No active session.");
  }
  const getSystemSettingsInternal = async () => {
    const settingsCollection = await getSystemSettingsCollection();
    let settings = await settingsCollection.findOne({ tenantId: session.tenantId }) as ISystemSettings;

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings: ISystemSettings = {
        tenantId: session.tenantId,
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

  return await withActionLogging(
    getSystemSettingsInternal,
    "Obter Configurações do Sistema",
    "SystemSettings",
    session.tenantId,
    ""
  )();
}

export async function updateSystemSettingsAction(updates: Partial<ISystemSettings>): Promise<IActionResult<void>> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized: No active session.");
  }
  const updateSystemSettingsInternal = async (updates: Partial<ISystemSettings>) => {
    const settingsCollection = await getSystemSettingsCollection();
    const result = await settingsCollection.updateOne(
      { tenantId: session.tenantId },
      { $set: { ...updates, updatedAt: new Date() } },
      { upsert: true } // Create if not exists
    );

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      throw new Error("Nenhuma alteração realizada ou configurações não encontradas.");
    }
    revalidatePath("/admin/settings"); // Adjust path as needed
    return { success: true };
  };

  return await withActionLogging(
    updateSystemSettingsInternal,
    "Atualizar Configurações do Sistema",
    "SystemSettings",
    session.tenantId,
    ""
  )(updates);
}
