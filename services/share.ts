'use server';

import { z } from 'zod';
import { createLinkSchema, verifyLinkSchema } from '@/lib/schemas/share.schema';
import { IShareableLink } from '@/models/ShareableLink';
import { IJob } from '@/models/Job';
import { getShareableLinksCollection, getJobsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid'; // For generating unique hash
import { withActionLogging } from '@/lib/actions'; // Updated import
import { ActionLogConfig } from '@/types/action-interface'; // Import ActionLogConfig

import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcrypt';

async function getSession() {
  const session = await getServerSession(authOptions);
  return {
    userId: session?.user?.id || null,
    tenantId: session?.user?.tenantId || null,
    roles: session?.user?.roles || [],
    userName: session?.user?.name || "Unknown User",
  };
}

async function createShareableLinkActionInternal(payload: z.infer<typeof createLinkSchema>) {
  // 1. Authentication and Authorization
  const session = await getSession();
  if (!session || !session.userId || !session.tenantId) {
    return { success: false, error: 'Usuário não autenticado ou sessão inválida.' };
  }

  // Check if user has permission to share the resource (placeholder)
  // This would involve checking the resource's tenantId against the session's tenantId
  // and verifying user roles/permissions for the specific resource type.

  // 2. Validate payload using Zod schema
  const validatedData = createLinkSchema.parse(payload);

  // 3. Business Logic: Generate unique hash and save link details
  const hash = uuidv4(); // Generate a unique hash
  let hashedPassword = undefined;
  if (validatedData.options?.password) {
    // In a real app, hash the password using bcrypt or similar
    hashedPassword = await bcrypt.hash(validatedData.options.password, 10);
  }

  const shareableLinksCollection = await getShareableLinksCollection();

  const newShareableLink: IShareableLink = {
    hash,
    type: validatedData.type,
    resourceId: new ObjectId(validatedData.resourceId),
    password: hashedPassword,
    expirationDate: validatedData.options?.expirationDate ? new Date(validatedData.options.expirationDate) : undefined,
    createdAt: new Date(),
  };

  await shareableLinksCollection.insertOne(newShareableLink);

  // Construct the full shareable URL (adjust base URL as needed)
  const shareableUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/share/${hash}`;

  return { success: true, data: { shareableLink: shareableUrl } };
}

async function verifySharedLinkActionInternal(payload: z.infer<typeof verifyLinkSchema>) {
  // 1. Validate payload using Zod schema
  const validatedData = verifyLinkSchema.parse(payload);
  const { hash, password } = validatedData;

  const shareableLinksCollection = await getShareableLinksCollection();

  // 2. Business Logic: Find and verify the shareable link
  const shareableLink = await shareableLinksCollection.findOne({ hash }) as IShareableLink;

  if (!shareableLink) {
    return { success: false, error: 'Link inválido ou não encontrado.' };
  }

  // Check expiration date
  if (shareableLink.expirationDate && shareableLink.expirationDate < new Date()) {
    return { success: false, error: 'Link expirado.' };
  }

  // Check password if required
  if (shareableLink.password && !(await bcrypt.compare(password, shareableLink.password))) {
    // In a real app, compare hashed passwords
    return { success: false, error: 'Senha incorreta.' };
  }

  // Retrieve the actual resource based on type and resourceId
  let resource: any = null;
  switch (shareableLink.type) {
    case 'job':
      const jobsCollection = await getJobsCollection();
      resource = await jobsCollection.findOne({ _id: shareableLink.resourceId }) as IJob;
      break;
    // Add cases for other resource types (report, dashboard) as needed
    default:
      return { success: false, error: 'Tipo de recurso desconhecido.' };
  }

  if (!resource) {
    return { success: false, error: 'Recurso associado não encontrado.' };
  }

  return { success: true, data: { resource: resource, type: shareableLink.type } };
}

export const createShareableLinkAction = async (payload: z.infer<typeof createLinkSchema>) => {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Criar Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: "", // Will be populated after creation
    successMessage: "Link compartilhável criado com sucesso!",
    errorMessage: "Erro ao criar link compartilhável.",
  };
  const wrappedAction = withActionLogging(createShareableLinkActionInternal, logConfig);
  const result = await wrappedAction(payload);
  if (result.success && result.data && result.data.shareableLink) {
    // Extract hash from the URL to use as resourceId
    const urlParts = result.data.shareableLink.split('/');
    logConfig.resourceId = urlParts[urlParts.length - 1];
  }
  return result;
};

export const verifySharedLinkAction = async (payload: z.infer<typeof verifyLinkSchema>) => {
  const logConfig: ActionLogConfig = {
    userId: "public", // Public action, no user ID
    userName: "Public User",
    actionType: "Verificar Link Compartilhável",
    resourceType: "ShareableLink",
    resourceId: payload.hash,
    successMessage: "Link verificado com sucesso!",
    errorMessage: "Erro ao verificar link compartilhável.",
  };
  const wrappedAction = withActionLogging(verifySharedLinkActionInternal, logConfig);
  return await wrappedAction(payload);
};
