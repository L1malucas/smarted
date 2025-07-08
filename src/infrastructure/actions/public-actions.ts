
"use server";

import { getCandidatesCollection, getJobsCollection } from "../persistence/db";
import { ObjectId } from "mongodb";
import { IJob } from "@/domain/models/Job";
import { ICandidate } from "@/domain/models/Candidate";
import { serializeJob } from "@/shared/lib/server-utils";
import { createLoggedAction } from "@/shared/lib/action-builder";

/**
 * Lista vagas públicas com base em filtros.
 */
export const listPublicJobsAction = createLoggedAction<
  [{
    tenantId?: string;
    searchQuery?: string;
    employmentType?: string;
    experienceLevel?: string;
    isPCDExclusive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
  }],
  { data: IJob[]; total: number; }
>({
  actionName: "Listar Vagas Públicas",
  resourceType: "Job",
  requireAuth: false,
  action: async ({ args: [filters] }) => {
    const { tenantId, searchQuery, employmentType, experienceLevel, isPCDExclusive, page = 1, limit = 10, sortBy } = filters;
    const jobsCollection = await getJobsCollection();
    
    const query: any = { status: "aberta" };
    if (tenantId) query.tenantId = tenantId;
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } },
      ];
    }
    if (employmentType) query.employmentType = employmentType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (isPCDExclusive !== undefined) query.isPCDExclusive = isPCDExclusive;

    const sortOptions: any = sortBy ? { [sortBy.split(":")[0]]: sortBy.split(":")[1] === 'desc' ? -1 : 1 } : { createdAt: -1 };

    const jobs = await jobsCollection.find(query).sort(sortOptions).skip((page - 1) * limit).limit(limit).toArray() as IJob[];
    const total = await jobsCollection.countDocuments(query);

    return {
      data: jobs.map(serializeJob),
      total,
    };
  },
  getDetails: (_, error) => error ? `Erro: ${error.message}` : `Busca pública de vagas realizada.`
});

/**
 * Obtém detalhes públicos de um candidato a partir de um hash.
 * (Implementação de exemplo, pode precisar de ajustes de segurança)
 */
export const getPublicCandidateDetailsAction = createLoggedAction<
  [string], // hash
  ICandidate | null
>({
  actionName: "Obter Detalhes de Candidato Público",
  resourceType: "Candidate",
  requireAuth: false,
  action: async ({ args: [hash] }) => {
    if (!ObjectId.isValid(hash)) {
      throw new Error("Hash de candidato inválido.");
    }
    const candidatesCollection = await getCandidatesCollection();
    const candidate = await candidatesCollection.findOne({ _id: new ObjectId(hash) });
    if (!candidate) {
      throw new Error("Candidato não encontrado.");
    }
    // Potencialmente remover dados sensíveis antes de retornar
    return candidate;
  },
  getResourceId: (_, args) => args[0],
});
