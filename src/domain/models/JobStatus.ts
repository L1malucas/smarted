/**
 * @description Represents the possible statuses of a job.
 */
export const JOB_STATUS_VALUES = ["aberta", "recrutamento", "triagem", "avaliação", "contato", "vaga fechada", "draft"] as const;
export type IJobStatus = typeof JOB_STATUS_VALUES[number];

/**
 * @description Represents the possible statuses for job filtering, including "all".
 */
export const JOB_FILTER_STATUS_VALUES = ["all", ...JOB_STATUS_VALUES] as const;
export type IJobFilterStatus = typeof JOB_FILTER_STATUS_VALUES[number];
