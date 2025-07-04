// components/admin/AdminPage.tsx
"use client"

import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, CalendarX, UserCog, History, LifeBuoy } from "lucide-react"
import { useParams } from "next/navigation"
import UserManagement from "@/components/admin/user-management";
import AuditLogs from "@/components/admin/audit-logs";
import ExpiredJobs from "@/components/admin/expired-jobs";
import Support from "@/components/admin/support";
import SystemSettings from "@/components/admin/system-settings";
export default function AdminPage() {
  const params = useParams();
  const tenantSlug = params.slug as string;

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
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}