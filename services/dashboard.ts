// services/dashboard.ts
import { DashboardData, MetricsData, UserActivityData } from "@/types/dashboard-interface"

export const dashboardService = {
  getMetrics: async (tenantSlug: string, period: "7d" | "30d" | "90d"): Promise<MetricsData[]> => {
    // Placeholder for future API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [
      { name: "Jan", vagasCriadas: 5, candidatosCadastrados: 45, contatosRealizados: 10, matches: 12, acoesPendentes: 3 },
      { name: "Fev", vagasCriadas: 7, candidatosCadastrados: 52, contatosRealizados: 15, matches: 18, acoesPendentes: 5 },
    ]
  },

  getUserActivity: async (tenantSlug: string, period: "7d" | "30d" | "90d"): Promise<UserActivityData[]> => {
    // Placeholder for future API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [
      { name: "Seg", logins: 10, acoes: 50 },
      { name: "Ter", logins: 12, acoes: 60 },
      { name: "Qua", logins: 8, acoes: 40 },
      { name: "Qui", logins: 15, acoes: 75 },
      { name: "Sex", logins: 11, acoes: 55 },
    ]
  },
}