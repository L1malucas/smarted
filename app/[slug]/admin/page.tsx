// components/admin/AdminPage.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, CalendarX, UserCog, History, LifeBuoy } from "lucide-react"
import { useParams } from "next/navigation"
import { AccessLog, AllowedCPF, SystemMetrics } from "@/types/admin-interface";
import { getSystemSettingsAction } from "@/services/admin"; // Keep this for now
import UserManagement from "@/components/admin/user-management";
import AuditLogs from "@/components/admin/audit-logs";
import ExpiredJobs from "@/components/admin/expired-jobs";
import Support from "@/components/admin/support";
import SystemSettings from "@/components/admin/system-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getAllowedCPFs } from "@/actions/admin-actions";

export default function AdminPage() {
  const params = useParams();
  const tenantSlug = params.slug as string;

  const [allowedCPFs, setAllowedCPFs] = useState<AllowedCPF[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoadingCPFs, setIsLoadingCPFs] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  useEffect(() => {
    const loadCPFs = async () => {
      setIsLoadingCPFs(true);
      try {
        const cpfs = await getAllowedCPFs();
        setAllowedCPFs(cpfs);
      } catch (error) {
        toast({
          title: "Erro ao carregar CPFs",
          description: "Não foi possível carregar a lista de CPFs autorizados." + error,
          variant: "destructive",
        });
      } finally {
        setIsLoadingCPFs(false);
      }
    };

    const loadMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        const result = await getSystemSettingsAction();
        if (result.success) {
          setSystemMetrics(result.data.settings);
        } else {
          toast({
            title: "Erro ao carregar Métricas",
            description: "Não foi possível carregar as métricas do sistema." + result.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar Métricas",
          description: "Não foi possível carregar as métricas do sistema." + error,
          variant: "destructive",
        });
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    loadCPFs();
    loadMetrics();
  }, [tenantSlug]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerenciamento do sistema ({tenantSlug}), usuários e logs.</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="users">
            <UserCog className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="expired_jobs">
            <CalendarX className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Vagas Expiradas
          </TabsTrigger>
          <TabsTrigger value="audit_logs">
            <History className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="support">
            <LifeBuoy className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Suporte
          </TabsTrigger>
          <TabsTrigger value="system_settings">
            <Settings className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        <TabsContent value="expired_jobs" className="space-y-6">
          <ExpiredJobs />
        </TabsContent>
        <TabsContent value="audit_logs" className="space-y-6">
          <AuditLogs />
        </TabsContent>
        <TabsContent value="support" className="space-y-6">
          <Support />
        </TabsContent>
        <TabsContent value="system_settings" className="space-y-6">
          {isLoadingMetrics ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <SystemSettings systemMetrics={systemMetrics} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}