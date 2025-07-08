export interface ISystemSettings {
  _id?: string;
  tenantId: string;
  maxUsersPerTenant: number;
  defaultLinkExpirationDays?: number;
  requirePasswordForPublicLinks?: boolean;
  allowPublicLinkSharing?: boolean;
  maxLinkViews?: number;
}