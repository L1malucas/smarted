
"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

import { createLoggedAction } from "@/shared/lib/action-builder";
import { IShareableLink } from "@/domain/models/ShareableLink";
import { ISystemSettings } from "@/domain/models/SystemSettings";
import { getShareableLinksCollection, getSystemSettingsCollection, getJobsCollection, getUsersCollection } from "../persistence/db";
import { getPublicDashboardMetricsAction } from "./dashboard-actions";
import { IJob } from "@/domain/models/Job";
import { ICandidate } from "@/domain/models/Candidate";

/**
 * Gera um novo link compartilhável.
 */
export const generateShareableLinkAction = createLoggedAction<
  [IShareableLink["resourceType"], string, string, { expiresAt?: Date; maxViews?: number; password?: string }?],
  IShareableLink
>({
  actionName: "Gerar Link Compartilhável",
  resourceType: "ShareableLink",
  requireAuth: true,
  action: async ({ session, args: [resourceType, resourceId, resourceName, options] }) => {
    const linksCollection = await getShareableLinksCollection();
    const settingsCollection = await getSystemSettingsCollection();
    const systemSettings = await settingsCollection.findOne({ tenantId: session.tenantId }) as ISystemSettings || {};

    const hash = uuidv4();
    const passwordHash = options?.password ? await bcrypt.hash(options.password, 10) : undefined;

    if (!passwordHash && systemSettings.requirePasswordForPublicLinks) {
      throw new Error("A configuração do sistema exige uma senha para links públicos.");
    }

    const newLink: Omit<IShareableLink, '_id'> = {
      resourceType,
      resourceId,
      resourceName,
      hash,
      tenantId: session.tenantId!,
      expiresAt: options?.expiresAt,
      maxViews: options?.maxViews || systemSettings.maxLinkViews || 0,
      passwordHash,
      createdBy: session.userId,
      createdByUserName: session.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewsCount: 0,
      isActive: true,
    };

    const result = await linksCollection.insertOne(newLink as any);
    revalidatePath(`/share/${hash}`);
    return { ...newLink, _id: result.insertedId };
  },
  getResourceId: (result) => result.hash,
});

/**
 * Obtém os detalhes de um link compartilhável e o recurso associado.
 */
export const getShareableLinkDetailsAction = createLoggedAction<
  [string, string?],
  { link: IShareableLink; resource: any }
>({
  actionName: "Acessar Link Compartilhável",
  resourceType: "ShareableLink",
  requireAuth: false,
  action: async ({ args: [hash, password] }) => {
    const linksCollection = await getShareableLinksCollection();
    let link = await linksCollection.findOne({ hash }) as IShareableLink;

    if (!link || !link.isActive || (link.expiresAt && new Date() > new Date(link.expiresAt)) || (link.maxViews && link.viewsCount >= link.maxViews)) {
      throw new Error("Link inválido, expirado ou limite de visualizações atingido.");
    }

    if (link.passwordHash && (!password || !await bcrypt.compare(password, link.passwordHash))) {
      throw new Error("Senha incorreta.");
    }

    await linksCollection.updateOne({ _id: link._id }, { $inc: { viewsCount: 1 }, $set: { lastAccessedAt: new Date() } });

    let resource: any = null;
    switch (link.resourceType) {
      case "job":
        const jobsCollection = await getJobsCollection();
        resource = await jobsCollection.findOne({ _id: new ObjectId(link.resourceId) });
        break;
      case "candidate_report":
        const usersCollection = await getUsersCollection();
        resource = await usersCollection.findOne({ _id: new ObjectId(link.resourceId) });
        break;
      case "dashboard":
        const metrics = await getPublicDashboardMetricsAction(link.resourceId, "30d");
        if (!metrics.success) throw new Error("Não foi possível carregar os dados do dashboard.");
        resource = metrics.data;
        break;
      default: throw new Error("Tipo de recurso desconhecido.");
    }

    if (!resource) throw new Error("Recurso associado não encontrado.");

    return { link, resource: JSON.parse(JSON.stringify(resource)) };
  },
  getResourceId: (_, args) => args[0],
});

/**
 * Desativa um link compartilhável.
 */
export const deactivateShareableLinkAction = createLoggedAction<
  [string],
  { success: boolean }
>({
  actionName: "Desativar Link Compartilhável",
  resourceType: "ShareableLink",
  requireAuth: true,
  action: async ({ session, args: [hash] }) => {
    const linksCollection = await getShareableLinksCollection();
    const link = await linksCollection.findOne({ hash }) as IShareableLink;

    if (!link) throw new Error("Link não encontrado.");
    if (link.createdBy !== session.userId && !session.isAdmin) {
      throw new Error("Você não tem permissão para desativar este link.");
    }

    const result = await linksCollection.updateOne({ hash }, { $set: { isActive: false, updatedAt: new Date() } });
    if (result.modifiedCount === 0) throw new Error("Nenhuma alteração realizada.");

    revalidatePath(`/share/${hash}`);
    return { success: true };
  },
  getResourceId: (_, args) => args[0],
});

// Outras actions (update, delete, list) podem ser refatoradas de forma similar.
