export interface ISystemSettings {
  _id?: string;
  maxUsersPerTenant: number;
  defaultLinkExpirationDays?: number;
  requirePasswordForPublicLinks?: boolean;
  allowPublicLinkSharing?: boolean;
  maxLinkViews?: number;
}