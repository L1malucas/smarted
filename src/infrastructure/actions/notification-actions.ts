"use server";

import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

import { getNotificationsCollection, getUsersCollection } from "@/infrastructure/persistence/db";
import { INotification } from "@/domain/models/Notification";
import { IUser } from "@/domain/models/User";
import { withActionLogging } from "@/shared/lib/actions";
import { IActionLogConfig, IActionResult } from "@/shared/types/types/action-interface";
import { verifyToken } from "@/infrastructure/auth/auth";

// Helper to get current user's info
async function getCurrentUser(): Promise<{ userId: string; tenantId: string; userName: string; isAdmin: boolean }> {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) throw new Error("Usuário não autenticado.");

  const decoded = await verifyToken(accessToken);
  if (!decoded) throw new Error("Token inválido.");

  return {
    userId: decoded.userId,
    tenantId: decoded.tenantId,
    userName: decoded.name || "Unknown User",
    isAdmin: decoded.isAdmin || false,
  };
}

export async function createNotificationAction(
  notificationData: Omit<INotification, "_id" | "createdAt" | "updatedAt" | "readAt" | "isRead" | "tenantId">
): Promise<IActionResult<INotification>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Criar Notificação",
    resourceType: "Notification",
    resourceId: "", // Will be populated after creation
    success: false,
  };

  const createNotificationInternal = async () => {
    const notificationsCollection = await getNotificationsCollection();
    const newNotification: INotification = {
      ...notificationData,
      tenantId: session.tenantId,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await notificationsCollection.insertOne(newNotification);
    const createdNotification = { ...newNotification, _id: result.insertedId.toString() };

    logConfig.resourceId = createdNotification._id;
    revalidatePath("/dashboard/notifications");
    return { success: true, data: createdNotification };
  };

  return await withActionLogging(createNotificationInternal, logConfig)();
}

export async function listNotificationsAction(
  options?: { isRead?: boolean; type?: string; page?: number; limit?: number; sortBy?: keyof INotification; sortOrder?: 1 | -1 }
): Promise<IActionResult<{ notifications: INotification[]; totalPages: number; currentPage: number; totalUnread: number }>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar Notificações",
    resourceType: "Notification",
    resourceId: session.userId,
    success: false,
  };

  const listNotificationsInternal = async () => {
    const notificationsCollection = await getNotificationsCollection();
    const query: any = { recipientId: session.userId, tenantId: session.tenantId };

    if (options?.isRead !== undefined) {
      query.isRead = options.isRead;
    }
    if (options?.type) {
      query.type = options.type;
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = options?.sortBy || "createdAt";
    const sortOrder = options?.sortOrder || -1; // Newest first

    const totalNotifications = await notificationsCollection.countDocuments(query);
    const totalUnread = await notificationsCollection.countDocuments({ recipientId: session.userId, tenantId: session.tenantId, isRead: false });
    const totalPages = Math.ceil(totalNotifications / limit);

    const notifications = await notificationsCollection.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray() as INotification[];

    // Convert ObjectId to string for client-side serialization
    const serializableNotifications = notifications.map(notif => ({
      ...notif,
      _id: notif._id.toString(),
      createdAt: notif.createdAt.toISOString(),
      updatedAt: notif.updatedAt.toISOString(),
      ...(notif.readAt && { readAt: notif.readAt.toISOString() }),
    }));

    return { success: true, data: { notifications: serializableNotifications, totalPages, currentPage: page, totalUnread } };
  };

  return await withActionLogging(listNotificationsInternal, logConfig)();
}

export async function markNotificationAsReadAction(
  notificationIds: string | string[]
): Promise<IActionResult<void>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Marcar Notificação como Lida",
    resourceType: "Notification",
    resourceId: Array.isArray(notificationIds) ? notificationIds.join(",") : notificationIds,
    success: false,
  };

  const markAsReadInternal = async () => {
    const notificationsCollection = await getNotificationsCollection();
    const idsToUpdate = Array.isArray(notificationIds) ? notificationIds.map(id => new ObjectId(id)) : [new ObjectId(notificationIds)];

    const result = await notificationsCollection.updateMany(
      { _id: { $in: idsToUpdate }, recipientId: session.userId, tenantId: session.tenantId, isRead: false },
      { $set: { isRead: true, readAt: new Date(), updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Nenhuma notificação encontrada ou atualizada.");
    }

    revalidatePath("/dashboard/notifications");
    return { success: true };
  };

  return await withActionLogging(markAsReadInternal, logConfig)();
}

export async function deleteNotificationAction(
  notificationIds: string | string[]
): Promise<IActionResult<void>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Excluir Notificação",
    resourceType: "Notification",
    resourceId: Array.isArray(notificationIds) ? notificationIds.join(",") : notificationIds,
    success: false,
  };

  const deleteInternal = async () => {
    const notificationsCollection = await getNotificationsCollection();
    const idsToDelete = Array.isArray(notificationIds) ? notificationIds.map(id => new ObjectId(id)) : [new ObjectId(notificationIds)];

    const result = await notificationsCollection.deleteMany(
      { _id: { $in: idsToDelete }, recipientId: session.userId, tenantId: session.tenantId },
    );

    if (result.deletedCount === 0) {
      throw new Error("Nenhuma notificação encontrada ou excluída.");
    }

    revalidatePath("/dashboard/notifications");
    return { success: true };
  };

  return await withActionLogging(deleteInternal, logConfig)();
}
