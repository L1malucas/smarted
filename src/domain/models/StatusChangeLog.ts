import { IJobStatus } from "./JobStatus";

export interface IStatusChangeLog {
  status: IJobStatus;
  changedAt: Date;
  changedBy: string;
  changedByName?: string;
}