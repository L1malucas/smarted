import { IBaseEntity } from "./base/BaseEntity";

export interface IShareableLink extends IBaseEntity {
  resourceType: "job" | "candidate_report" | "dashboard";
  resourceId: string;
  resourceName: string;
  hash: string;
  tenantId: string;
  expiresAt?: Date;
  maxViews?: number;
  passwordHash?: string;
  createdBy: string;
  createdByUserName: string;
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  isActive: boolean;
}