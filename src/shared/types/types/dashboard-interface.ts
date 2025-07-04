// types/dashboard.ts
export interface MetricsData {
  name: string
  vagasCriadas: number
  candidatosCadastrados: number
  contatosRealizados: number
  matches: number
  acoesPendentes: number
}

export interface UserActivityData {
  name: string
  logins: number
  acoes: number
}

export interface DashboardData {
  metrics: MetricsData[]
  userActivity: UserActivityData[]
}