"use server";

import { revalidatePath } from "next/cache";
import { getUsersCollection, getLogsCollection } from "@/lib/db"; // Assuming getLogsCollection exists
import { IUser } from "@/models/User";
import { ILog } from "@/models/Log"; // Assuming ILog is defined in models/Log.ts
import { ObjectId } from "mongodb";
import { AllowedCPF, AccessLog } from "@/types/admin-interface"; // Import necessary types
import { withActionLogging } from "@/lib/actions";
import { ActionLogConfig } from "@/types/action-interface";
import { auditService } from "@/services/audit";

// Helper to get current user's info (mocked for now)
// In a real app, you'd get this from the session
async function getCurrentUser() {
  // This is a placeholder. Replace with actual session logic.
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" });
  if (!user) throw new Error("Authenticated user not found.");
  return {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    userName: user.name || "Unknown User",
  };
}

export async function getTenantUsers(): Promise<IUser[]> {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar Usuários",
    resourceType: "User",
    resourceId: session.tenantId,
    successMessage: "Usuários listados com sucesso!",
    errorMessage: "Erro ao listar usuários.",
  };

  const getTenantUsersInternal = async () => {
    const { tenantId } = await getCurrentUser();
    // console.log(`[Admin Action] Fetching users for tenant: ${tenantId}`);
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({ tenantId }).toArray();
    // console.log(`[Admin Action] Found ${users.length} users.`);
    return JSON.parse(JSON.stringify(users));
  };

  return await withActionLogging(getTenantUsersInternal, logConfig)();
}

export async function addUser(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'tenantId' | 'slug'>) {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Adicionar Usuário",
    resourceType: "User",
    resourceId: "", // Will be populated after creation
    successMessage: "Usuário adicionado com sucesso!",
    errorMessage: "Erro ao adicionar usuário.",
  };

  const addUserInternal = async (userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'tenantId' | 'slug'>) => {
    const { userId, tenantId } = await getCurrentUser();
    // console.log(`[Admin Action] User ${userId} is adding a new user to tenant ${tenantId}`);
    
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

    const result = await usersCollection.insertOne(newUser);
    // console.log("[Admin Action] New user added successfully:", result.insertedId);
    revalidatePath("/admin/users"); // Adjust path as needed
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
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Atualizar Usuário",
    resourceType: "User",
    resourceId: userIdToUpdate,
    successMessage: "Usuário atualizado com sucesso!",
    errorMessage: "Erro ao atualizar usuário.",
  };

  const updateUserInternal = async (userIdToUpdate: string, updates: Partial<IUser>) => {
    const { userId } = await getCurrentUser();
    // console.log(`[Admin Action] User ${userId} is updating user ${userIdToUpdate}`);

    const usersCollection = await getUsersCollection();
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToUpdate) },
      { $set: { ...updates, updatedAt: new Date(), updatedBy: userId } }
    );

    if (result.modifiedCount === 0) {
      // console.warn("[Admin Action] No user found or no changes made for ID:", userIdToUpdate);
      throw new Error("Usuário não encontrado ou nenhuma alteração realizada.");
    }

    // console.log("[Admin Action] User updated successfully:", userIdToUpdate);
    revalidatePath("/admin/users");
    return { success: true };
  };

  return await withActionLogging(updateUserInternal, logConfig)(userIdToUpdate, updates);
}

export async function deactivateUser(userIdToDeactivate: string) {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Desativar Usuário",
    resourceType: "User",
    resourceId: userIdToDeactivate,
    successMessage: "Usuário desativado com sucesso!",
    errorMessage: "Erro ao desativar usuário.",
  };

  const deactivateUserInternal = async (userIdToDeactivate: string) => {
    const { userId } = await getCurrentUser();
    // console.log(`[Admin Action] User ${userId} is deactivating user ${userIdToDeactivate}`);

    const usersCollection = await getUsersCollection();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userIdToDeactivate) },
      { $set: { status: 'inactive', updatedAt: new Date(), updatedBy: userId } }
    );

    if (result.modifiedCount === 0) {
      // console.warn("[Admin Action] No user found to deactivate for ID:", userIdToDeactivate);
      throw new Error("Usuário não encontrado.");
    }

    // console.log("[Admin Action] User deactivated successfully:", userIdToDeactivate);
    revalidatePath("/admin/users");
    return { success: true };
  };

  return await withActionLogging(deactivateUserInternal, logConfig)(userIdToDeactivate);
}

export async function getAllowedCPFs(): Promise<AllowedCPF[]> {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar CPFs Autorizados",
    resourceType: "User",
    resourceId: session.tenantId,
    successMessage: "CPFs autorizados listados com sucesso!",
    errorMessage: "Erro ao listar CPFs autorizados.",
  };

  const getAllowedCPFsInternal = async () => {
    const { tenantId } = await getCurrentUser();
    // console.log(`[Admin Action] Fetching allowed CPFs for tenant: ${tenantId}`);
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({ tenantId, status: 'active' }).toArray();
    
    // Map to AllowedCPF interface
    const allowedCPFs: AllowedCPF[] = users.map(user => ({
      cpf: user.cpf,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    // console.log(`[Admin Action] Found ${allowedCPFs.length} allowed CPFs.`);
    return JSON.parse(JSON.stringify(allowedCPFs));
  };

  return await withActionLogging(getAllowedCPFsInternal, logConfig)();
}

export async function getAccessLogs(startDate?: Date, endDate?: Date, page: number = 1, limit: number = 10): Promise<{ logs: AccessLog[], totalPages: number, currentPage: number }> {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar Logs de Auditoria",
    resourceType: "AuditLog",
    resourceId: session.tenantId,
    successMessage: "Logs de auditoria listados com sucesso!",
    errorMessage: "Erro ao listar logs de auditoria.",
  };

  const getAccessLogsInternal = async (startDate?: Date, endDate?: Date, page: number = 1, limit: number = 10) => {
    const { tenantId } = await getCurrentUser();
    // console.log(`[Admin Action] Fetching access logs for tenant: ${tenantId} with filters: startDate=${startDate}, endDate=${endDate}, page=${page}, limit=${limit}`);
    const logsCollection = await getLogsCollection();

    const query: any = { tenantId };
    if (startDate) {
      query.timestamp = { ...query.timestamp, $gte: startDate };
    }
    if (endDate) {
      query.timestamp = { ...query.timestamp, $lte: endDate };
    }
    // console.log(`[Admin Action] MongoDB Query for logs:`, JSON.stringify(query));

    const totalLogs = await logsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / limit);

    const logs = await logsCollection.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // console.log(`[Admin Action] Raw logs fetched from DB:`, logs);

    const accessLogs: AccessLog[] = logs.map(log => ({
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

    // console.log(`[Admin Action] Found ${accessLogs.length} access logs for page ${page} of ${totalPages}.`);
    return { logs: JSON.parse(JSON.stringify(accessLogs)), totalPages, currentPage: page };
  };

  return await withActionLogging(getAccessLogsInternal, logConfig)(startDate, endDate, page, limit);
}