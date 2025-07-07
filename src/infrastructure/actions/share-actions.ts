"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

import { withActionLogging } from "@/shared/lib/actions";
import { IActionLogConfig, IActionResult } from "@/shared/types/types/action-interface";
import { IShareableLink } from "@/domain/models/ShareableLink";
import { ISystemSettings } from "@/domain/models/SystemSettings";
import { getShareableLinksCollection, getSystemSettingsCollection, getJobsCollection, getUsersCollection } from "../persistence/db";
import { getPublicDashboardMetricsAction } from "./dashboard-actions";
import { IUser } from "@/domain/models/User";
import { IJob } from "@/domain/models/Job";
import { ICandidate } from "@/domain/models/Candidate"; // Assuming ICandidate is defined

// Helper to get current user's info (mocked for now)
async function getCurrentUser(): Promise<{ userId: string; tenantId: string; userName: string; isAdmin: boolean }> {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" }) as IUser;
  if (!user) throw new Error("Authenticated user not found.");
  return {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    userName: user.name || "Unknown User",
    isAdmin: user.isAdmin || false, // Assuming isAdmin property exists on IUser
  };
}

export async function generateShareableLinkAction(
  resourceType: IShareableLink["resourceType"],
  resourceId: string,
  resourceName: string,
  options?: { expiresAt?: Date; maxViews?: number; password?: string }
): Promise<IActionResult<IShareableLink>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Gerar Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: resourceId,
    success: false
  };

  const generateLinkInternal = async () => {
    const { tenantId } = await getCurrentUser();
    const linksCollection = await getShareableLinksCollection();
    const settingsCollection = await getSystemSettingsCollection();

    const systemSettings = await settingsCollection.findOne({ tenantId }) as ISystemSettings || {};

    const hash = uuidv4();
    let passwordHash: string | undefined;
    if (options?.password) {
      passwordHash = await bcrypt.hash(options.password, 10);
    } else if (systemSettings.requirePasswordForPublicLinks) {
      throw new Error("A configuração do sistema exige uma senha para links públicos.");
    }

    const newLink: IShareableLink = {
      resourceType,
      resourceId,
      resourceName,
      hash,
      tenantId,
      expiresAt: options?.expiresAt || (systemSettings.defaultLinkExpirationDays ? new Date(Date.now() + systemSettings.defaultLinkExpirationDays * 24 * 60 * 60 * 1000) : undefined),
      maxViews: options?.maxViews || systemSettings.maxLinkViews || 0, // 0 for unlimited
      passwordHash,
      createdBy: session.userId,
      createdByUserName: session.userName,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewsCount: 0,
      isActive: true,
    };

    const result = await linksCollection.insertOne(newLink);
    revalidatePath(`/share/${hash}`); // Revalidate path for the new link
    return { success: true, data: { ...newLink, _id: result.insertedId.toString() } };
  };

  return await withActionLogging(generateLinkInternal, logConfig)();
}

export async function getShareableLinkDetailsAction(
  hash: string,
  password?: string
): Promise<IActionResult<{ link: IShareableLink; resource: any }>> {
  const logConfig: IActionLogConfig = {
    userId: "public-access", // Public access, no specific user ID
    userName: "Public Access",
    actionType: "Acessar Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: hash,
    success: false
  };

  const getLinkDetailsInternal = async () => {
    const linksCollection = await getShareableLinksCollection();
    let link = await linksCollection.findOne({ hash }) as IShareableLink;

    if (!link) {
      throw new Error("Link não encontrado.");
    }

    if (!link.isActive) {
      throw new Error("Link inativo.");
    }

    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      throw new Error("Link expirado.");
    }

    if (link.maxViews && link.maxViews > 0 && link.viewsCount >= link.maxViews) {
      throw new Error("Limite de visualizações atingido.");
    }

    if (link.passwordHash) {
      if (!password) {
        throw new Error("Este link requer uma senha.");
      }
      const isPasswordCorrect = await bcrypt.compare(password, link.passwordHash);
      if (!isPasswordCorrect) {
        throw new Error("Senha incorreta.");
      }
    }

    // Increment viewsCount and update lastAccessedAt
    await linksCollection.updateOne(
      { _id: link._id },
      { $inc: { viewsCount: 1 }, $set: { lastAccessedAt: new Date() } }
    );

    // Re-fetch the link to get updated viewsCount and lastAccessedAt
    link = await linksCollection.findOne({ hash }) as IShareableLink;

    let resource: any = null; // Placeholder for the actual resource
    switch (link.resourceType) {
      case "job":
        const jobsCollection = await getJobsCollection();
        resource = await jobsCollection.findOne({ _id: new ObjectId(link.resourceId) }) as IJob;
        break;
      case "candidate_report":
        const usersCollection = await getUsersCollection(); // Assuming candidates are users
        resource = await usersCollection.findOne({ _id: new ObjectId(link.resourceId) }) as ICandidate;
        break;
      case "dashboard":
        const dashboardMetrics = await getPublicDashboardMetricsAction(link.resourceId, "30d"); // Assuming resourceId is tenantId
        if (dashboardMetrics.success && dashboardMetrics.data) {
          resource = dashboardMetrics.data;
        } else {
          throw new Error("Não foi possível carregar os dados do dashboard.");
        }
        break;
      default:
        throw new Error("Tipo de recurso desconhecido.");
    }

    if (!resource) {
      throw new Error("Recurso associado não encontrado.");
    }

    return { success: true, data: { link, resource: JSON.parse(JSON.stringify(resource)) } };
  };

  return await withActionLogging(getLinkDetailsInternal, logConfig)();
}

export async function updateShareableLinkAction(
  hash: string,
  updates: Partial<Omit<IShareableLink, "_id" | "resourceType" | "resourceId" | "hash" | "tenantId" | "createdBy" | "createdAt" | "viewsCount" | "createdByUserName" | "lastAccessedAt" | "updatedAt" | "passwordHash"> & { password?: string }>
): Promise<IActionResult<void>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Atualizar Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: hash,
    success: false
  };

  const updateLinkInternal = async () => {
    const linksCollection = await getShareableLinksCollection();
    const link = await linksCollection.findOne({ hash }) as IShareableLink;

    if (!link) {
      throw new Error("Link não encontrado.");
    }

    // Authorization check: Only creator or admin can update
    if (link.createdBy !== session.userId && !session.isAdmin) { // Assuming session has isAdmin property
      throw new Error("Você não tem permissão para atualizar este link.");
    }

    const updateDoc: any = { ...updates };

    if (updates.password !== undefined) {
      updateDoc.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updateDoc.password; // Remove plain password from update object
    }

    // Prevent updating immutable fields
    delete updateDoc.resourceType;
    delete updateDoc.resourceId;
    delete updateDoc.hash;
    delete updateDoc.tenantId;
    delete updateDoc.createdBy;
    delete updateDoc.createdAt;
    delete updateDoc.viewsCount;
    delete updateDoc.createdByUserName;
    delete updateDoc.lastAccessedAt;

    const result = await linksCollection.updateOne(
      { _id: link._id },
      { $set: { ...updateDoc, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Nenhuma alteração realizada ou link não encontrado.");
    }

    revalidatePath(`/share/${hash}`);
    return { success: true };
  };

  return await withActionLogging(updateLinkInternal, logConfig)();
}

export async function deactivateShareableLinkAction(
  hash: string
): Promise<IActionResult<void>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Desativar Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: hash,
    success: false
  };

  const deactivateLinkInternal = async () => {
    const linksCollection = await getShareableLinksCollection();
    const link = await linksCollection.findOne({ hash }) as IShareableLink;

    if (!link) {
      throw new Error("Link não encontrado.");
    }

    // Authorization check: Only creator or admin can deactivate
    if (link.createdBy !== session.userId && !session.isAdmin) {
      throw new Error("Você não tem permissão para desativar este link.");
    }

    const result = await linksCollection.updateOne(
      { _id: link._id },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Nenhuma alteração realizada ou link não encontrado.");
    }

    revalidatePath(`/share/${hash}`);
    return { success: true };
  };

  return await withActionLogging(deactivateLinkInternal, logConfig)();
}

export async function deleteShareableLinkAction(
  hash: string
): Promise<IActionResult<void>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Excluir Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: hash,
    success: false
  };

  const deleteLinkInternal = async () => {
    const linksCollection = await getShareableLinksCollection();
    const link = await linksCollection.findOne({ hash }) as IShareableLink;

    if (!link) {
      throw new Error("Link não encontrado.");
    }

    // Authorization check: Only creator or admin can delete
    if (link.createdBy !== session.userId && !session.isAdmin) {
      throw new Error("Você não tem permissão para excluir este link.");
    }

    const result = await linksCollection.deleteOne({ _id: link._id });

    if (result.deletedCount === 0) {
      throw new Error("Nenhum link encontrado para exclusão.");
    }

    revalidatePath(`/share/${hash}`);
    return { success: true };
  };

  return await withActionLogging(deleteLinkInternal, logConfig)();
}

export async function listShareableLinksAction(
  options?: {
    resourceType?: IShareableLink["resourceType"];
    resourceId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: keyof IShareableLink;
    sortOrder?: 1 | -1;
  }
): Promise<IActionResult<{ links: IShareableLink[]; totalPages: number; currentPage: number }>> {
  const session = await getCurrentUser();
  const logConfig: IActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Listar Links Compartilháveis",
    resourceType: "ShareableLink",
    resourceId: session.tenantId,
    success: false
  };

  const listLinksInternal = async () => {
    const { tenantId } = await getCurrentUser();
    const linksCollection = await getShareableLinksCollection();

    const query: any = { tenantId };
    if (options?.resourceType) {
      query.resourceType = options.resourceType;
    }
    if (options?.resourceId) {
      query.resourceId = options.resourceId;
    }
    if (options?.isActive !== undefined) {
      query.isActive = options.isActive;
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = options?.sortBy || "createdAt";
    const sortOrder = options?.sortOrder || -1; // Newest first

    const totalLinks = await linksCollection.countDocuments(query);
    const totalPages = Math.ceil(totalLinks / limit);

    const links = await linksCollection.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray() as IShareableLink[];

    return { success: true, data: { links: JSON.parse(JSON.stringify(links)), totalPages, currentPage: page } };
  };

  return await withActionLogging(listLinksInternal, logConfig)();
}

export async function verifyShareableLinkPasswordAction(
  hash: string,
  password: string
): Promise<IActionResult<boolean>> {
  const logConfig: IActionLogConfig = {
    userId: "public-access", // Public access, no specific user ID
    userName: "Public Access",
    actionType: "Verificar Senha de Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: hash,
    success: false
  };

  const verifyPasswordInternal = async () => {
    const linksCollection = await getShareableLinksCollection();
    const link = await linksCollection.findOne({ hash }) as IShareableLink;

    if (!link) {
      throw new Error("Link não encontrado.");
    }

    if (!link.passwordHash) {
      throw new Error("Este link não está protegido por senha.");
    }

    const isPasswordCorrect = await bcrypt.compare(password, link.passwordHash);

    return { success: true, data: isPasswordCorrect };
  };

  return await withActionLogging(verifyPasswordInternal, logConfig)();
}

export async function incrementLinkViewCountAction(
  hash: string
): Promise<IActionResult<void>> {
  const logConfig: IActionLogConfig = {
    userId: "public-access", // Public access, no specific user ID
    userName: "Public Access",
    actionType: "Incrementar Visualização de Link",
    resourceType: "ShareableLink",
    resourceId: hash,
    success: false
  };

  const incrementViewCountInternal = async () => {
    const linksCollection = await getShareableLinksCollection();
    const link = await linksCollection.findOne({ hash }) as IShareableLink;

    if (!link) {
      throw new Error("Link não encontrado.");
    }

    const result = await linksCollection.updateOne(
      { _id: link._id },
      { $inc: { viewsCount: 1 }, $set: { lastAccessedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Nenhuma alteração realizada ou link não encontrado.");
    }

    return { success: true };
  };

  return await withActionLogging(incrementViewCountInternal, logConfig)();
}