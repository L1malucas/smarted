"use server";

import { getUsersCollection } from "@/infrastructure/persistence/db";
import { ObjectId } from "mongodb";
import { withActionLogging } from "@/shared/lib/actions";
import { IUser } from "@/domain/models/User"; 
import { ActionLogConfig } from "@/shared/types/types/action-interface";

// Helper to get current user's info (mocked for now)
async function getCurrentUser() {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: "admin@smarted.com" });
  if (!user) throw new Error("Authenticated user not found.");
  return {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    userName: user.name || "Unknown User",
  };
}

async function getCandidateDetailsActionInternal(candidateId: string): Promise<IUser | null> {
  const { tenantId } = await getCurrentUser();
  const usersCollection = await getUsersCollection();
  const candidate = await usersCollection.findOne({ _id: new ObjectId(candidateId), tenantId });
  return JSON.parse(JSON.stringify(candidate));
}

export const getCandidateDetailsAction = async (candidateId: string) => {
  const session = await getCurrentUser();
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Obter Detalhes do Candidato",
    resourceType: "Candidate",
    resourceId: candidateId,
    successMessage: "Detalhes do candidato obtidos com sucesso!",
    errorMessage: "Erro ao obter detalhes do candidato.",
    success: false
  };
  return await withActionLogging(getCandidateDetailsActionInternal, logConfig)(candidateId);
};
