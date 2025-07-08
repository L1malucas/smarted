import { IJob } from "@/domain/models/Job";

// Helper to serialize job objects for client components
export function serializeJob(job: any): IJob {
  if (!job) return job;

  const serializedJob = {
    ...job,
    _id: job._id.toString(),
    createdBy: job.createdBy.toString(),
    createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
    updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : job.updatedAt,
    criteriaWeights: job.criteriaWeights || { experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 },
  };

  if (serializedJob.competencies) {
    serializedJob.competencies = serializedJob.competencies.map((comp: any) => ({
      ...comp,
      _id: comp._id ? comp._id.toString() : undefined, // Handle optional _id
    }));
  }

  if (serializedJob.questions) {
    serializedJob.questions = serializedJob.questions.map((q: any) => ({
      ...q,
      _id: q._id ? q._id.toString() : undefined, // Handle optional _id
    }));
  }

  if (serializedJob.statusChangeLog) {
    serializedJob.statusChangeLog = serializedJob.statusChangeLog.map((log: any) => ({
      ...log,
      changedBy: log.changedBy.toString(),
      changedAt: log.changedAt instanceof Date ? log.changedAt.toISOString() : log.changedAt,
    }));
  }

  return serializedJob;
}

import { ICandidate } from "@/domain/models/Candidate";

export function serializeCandidate(candidate: any): ICandidate {
  if (!candidate) return candidate;

  const serializedCandidate = {
    ...candidate,
    _id: candidate._id.toString(),
    jobId: candidate.jobId.toString(),
    createdAt: candidate.createdAt instanceof Date ? candidate.createdAt.toISOString() : candidate.createdAt,
    updatedAt: candidate.updatedAt instanceof Date ? candidate.updatedAt.toISOString() : candidate.updatedAt,
  };

  return serializedCandidate;
}
