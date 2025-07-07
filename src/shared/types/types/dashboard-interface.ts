export interface IMetricsData {
  totalVagasCriadas: number;
  totalCandidatos: number;
  totalContatos: number;
  totalMatches: number;
  totalAcoesPendentes: number;
}

export interface IUserActivityData {
  name: string;
  logins: number;
  acoes: number;
}

export interface IDashboardData {
  metrics: IMetricsData;
  userActivity: IUserActivityData[];
}

export interface ISystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  totalCandidates: number;
  systemUptime: string;
  avgResponseTime: string;
}
