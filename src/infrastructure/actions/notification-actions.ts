"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getNotificationsCollection } from "@/infrastructure/persistence/db";
import { INotification } from "@/domain/models/Notification";
import { createLoggedAction } from "@/shared/lib/action-builder";

/**
 * Cria uma nova notificação.
 */
export const createNotificationAction = createLoggedAction<
  [Omit<INotification, "_id" | "createdAt" | "updatedAt" | "readAt" | "isRead" | "tenantId">],
  INotification
>({
  actionName: "Criar Notificação",
  resourceType: "Notification",
  requireAuth: true,
  action: async ({ session, args: [notificationData] }) => {
    const notificationsCollection = await getNotificationsCollection();
    const newNotification: INotification = {
      ...notificationData,
      tenantId: session.tenantId!,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await notificationsCollection.insertOne(newNotification as any);
    const createdNotification = { ...newNotification, _id: result.insertedId };

    revalidatePath("/[slug]/dashboard/notifications", "layout");
    return createdNotification;
  },
  getResourceId: (result) => result._id?.toString(),
});

/**
 * Lista as notificações do usuário logado.
 */
export const listNotificationsAction = createLoggedAction<
  [({ isRead?: boolean; type?: string; page?: number; limit?: number; sortBy?: keyof INotification; sortOrder?: 1 | -1 })?],
  { notifications: INotification[]; totalPages: number; currentPage: number; totalUnread: number }
>({
  actionName: "Listar Notificações",
  resourceType: "Notification",
  requireAuth: true,
  action: async ({ session, args: [options] }) => {
    const notificationsCollection = await getNotificationsCollection();
    const query: any = { recipientId: session.userId, tenantId: session.tenantId };

    if (options?.isRead !== undefined) query.isRead = options.isRead;
    if (options?.type) query.type = options.type;

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || "createdAt";
    const sortOrder = options?.sortOrder || -1;

    const totalNotifications = await notificationsCollection.countDocuments(query);
    const totalUnread = await notificationsCollection.countDocuments({ recipientId: session.userId, tenantId: session.tenantId, isRead: false });
    const totalPages = Math.ceil(totalNotifications / limit);

    const notifications = await notificationsCollection.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).toArray() as INotification[];

    const serializableNotifications = notifications.map(notif => ({
      ...notif,
      _id: notif._id?.toString(),
    }));

    return { notifications: JSON.parse(JSON.stringify(serializableNotifications)), totalPages, currentPage: page, totalUnread };
  },
  getResourceId: (result, args) => args[0]?.type, // Log by type if available
});

/**
 * Marca uma ou mais notificações como lidas.
 */
export const markNotificationAsReadAction = createLoggedAction<
  [string | string[]],
  { modifiedCount: number }
>({
  actionName: "Marcar Notificação como Lida",
  resourceType: "Notification",
  requireAuth: true,
  action: async ({ session, args: [notificationIds] }) => {
    const notificationsCollection = await getNotificationsCollection();
    const idsToUpdate = (Array.isArray(notificationIds) ? notificationIds : [notificationIds]).map(id => new ObjectId(id));

    const result = await notificationsCollection.updateMany(
      { _id: { $in: idsToUpdate }, recipientId: session.userId, tenantId: session.tenantId, isRead: false },
      { $set: { isRead: true, readAt: new Date(), updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      // Not throwing an error, as it's not critical if they were already read.
      console.log("Nenhuma notificação nova marcada como lida.");
    }

    revalidatePath("/[slug]/dashboard/notifications", "layout");
    return { modifiedCount: result.modifiedCount };
  },
  getResourceId: (_, args) => Array.isArray(args[0]) ? args[0].join(",") : args[0],
});

/**
 * Exclui uma ou mais notificações.
 */
export const deleteNotificationAction = createLoggedAction<
  [string | string[]],
  { deletedCount: number }
>({
  actionName: "Excluir Notificação",
  resourceType: "Notification",
  requireAuth: true,
  action: async ({ session, args: [notificationIds] }) => {
    const notificationsCollection = await getNotificationsCollection();
    const idsToDelete = (Array.isArray(notificationIds) ? notificationIds : [notificationIds]).map(id => new ObjectId(id));

    const result = await notificationsCollection.deleteMany(
      { _id: { $in: idsToDelete }, recipientId: session.userId, tenantId: session.tenantId },
    );

    if (result.deletedCount === 0) {
      throw new Error("Nenhuma notificação encontrada para exclusão.");
    }

    revalidatePath("/[slug]/dashboard/notifications", "layout");
    return { deletedCount: result.deletedCount };
  },
  getResourceId: (_, args) => Array.isArray(args[0]) ? args[0].join(",") : args[0],
});