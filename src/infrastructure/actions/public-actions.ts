"use server";

import { withActionLogging } from "@/shared/lib/actions";
import { getJobsCollection, getCandidatesCollection } from "../persistence/db";
import { IJob } from "@/domain/models/Job";
import { ICandidate } from "@/domain/models/Candidate";
import { serializeJob } from "@/shared/lib/server-utils";
import { IActionLogConfig } from "@/shared/types/types/action-interface";

export const listPublicJobsAction = withActionLogging(
  async (filters: {
    tenantId?: string;
    searchQuery?: string;
    employmentType?: string;
    experienceLevel?: string;
    isPCDExclusive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) => {
    const jobsCollection = await getJobsCollection();
    const { tenantId, searchQuery, employmentType, experienceLevel, isPCDExclusive, page = 1, limit = 10, sortBy } = filters;

    const query: any = { status: "aberta" }; // Always filter by open jobs

    if (tenantId) {
      query.tenantId = tenantId;
    }

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { department: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (employmentType) {
      query.employmentType = employmentType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (isPCDExclusive !== undefined) {
      query.isPCDExclusive = isPCDExclusive;
    }

    const sortOptions: any = {};
    if (sortBy) {
      const [field, order] = sortBy.split(":");
      sortOptions[field] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by creation date
    }

    const jobs = await jobsCollection
      .find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray() as unknown as IJob[];

    const total = await jobsCollection.countDocuments(query);

    const serializedJobs = jobs.map(job => serializeJob(job));

    return {
      data: serializedJobs as IJob[],
      total,
    };
  },
  {
    userId: "public", // Special userId for public actions
    userName: "Public User", // Special userName for public actions
    actionType: "Listar Vagas Públicas",
    resourceType: "Job",
    resourceId: "",
    success: false,
  } as IActionLogConfig
);

export const getPublicCandidateDetailsAction = withActionLogging(
  async (hash: string) => {
    const candidatesCollection = await getCandidatesCollection();
    const candidate = await candidatesCollection.findOne({ _id: hash }) as unknown as ICandidate;
    if (!candidate) {
      throw new Error("Candidato não encontrado.");
    }
    return candidate;
  },
  {
    userId: "public",
    userName: "Public User",
    actionType: "Obter Detalhes de Candidato Público",
    resourceType: "Candidate",
    resourceId: "",
    success: false,
  } as IActionLogConfig
);