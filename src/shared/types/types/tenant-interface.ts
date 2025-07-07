export interface ITenantContextType {
  tenantSlug: string | null;
  tenantName: string | null;
  isLoading: boolean;
  setTenantData: (slug: string, name: string) => void;
}