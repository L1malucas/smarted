
"use server";

import { createLoggedAction } from "@/shared/lib/action-builder";
import { ISystemMetrics, IUserActivityData } from "@/shared/types/types/dashboard-interface";

/**
 * Obtém as métricas públicas do dashboard para um tenant específico.
 */
export const getPublicDashboardMetricsAction = createLoggedAction<
  [string, string],
  ISystemMetrics
>({
  actionName: "Obter Métricas do Dashboard Público",
  resourceType: "Dashboard",
  requireAuth: false, // Ação pública
  action: async ({ args: [tenantId, period] }) => {
    // Lógica para buscar métricas reais do banco de dados iria aqui.
    // Por enquanto, retornamos dados mockados/padrão.
    const defaultMetrics: ISystemMetrics = {
      totalUsers: 150, // Mock
      activeUsers: 120, // Mock
      totalJobs: 25, // Mock
      totalCandidates: 500, // Mock
      systemUptime: "99.9%", // Mock
      avgResponseTime: "120ms", // Mock
      jobsCreated: [], // Mock
      candidatesApplied: [], // Mock
      hires: [], // Mock
    };
    return defaultMetrics;
  },
  getResourceId: (_, args) => args[0], // tenantId
});

/**
 * Obtém os dados para o gráfico de atividade do usuário.
 */
export const getUserActivityChartDataAction = createLoggedAction<
  [string, string],
  IUserActivityData[]
>({
  actionName: "Obter Dados de Atividade do Usuário",
  resourceType: "Dashboard",
  requireAuth: true, // Requer autenticação para ver dados de atividade
  action: async ({ session, args: [tenantId, period] }) => {
    // TODO: Substituir por agregação de dados reais da coleção AuditLog
    // A consulta usaria o `session.tenantId` para segurança.
    const mockData: IUserActivityData[] = [
      { name: 'Seg', logins: 4, acoes: 24 },
      { name: 'Ter', logins: 3, acoes: 13 },
      { name: 'Qua', logins: 6, acoes: 48 },
      { name: 'Qui', logins: 5, acoes: 39 },
      { name: 'Sex', logins: 8, acoes: 60 },
      { name: 'Sáb', logins: 2, acoes: 10 },
      { name: 'Dom', logins: 1, acoes: 5 },
    ];
    return mockData;
  },
  getResourceId: (_, args) => args[0], // tenantId
});
