export interface ISharedResourceInfo {
  resourceType: "job" | "candidates" | "report";
  resourceId: string;
  tenantSlug?: string;
  expiresAt?: number;
  passwordHash?: string;
}
