// components/admin/AdminPage.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Settings, CalendarX, UserCog, History, LifeBuoy } from "lucide-react"
import { useParams } from "next/navigation"
import { AccessLog, AllowedCPF, SystemMetrics } from "@/types/admin-interface"
import { adminService } from "@/services/admin"
import UserManagement from "@/components/admin/user-management"
import AuditLogs from "@/components/admin/audit-logs"
import ExpiredJobs from "@/components/admin/expired-jobs"
import Support from "@/components/admin/support"
import SystemSettings from "@/components/admin/system-settings"

export default function AdminPage() {
  const params = useParams()
  const tenantSlug = params.slug as string

  const [allowedCPFs, setAllowedCPFs] = useState<AllowedCPF[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)

  // Local storage keys
  const ALLOWED_CPFS_KEY = `allowed_cpfs_${tenantSlug}`
  const ACCESS_LOGS_KEY = `access_logs_${tenantSlug}`

  // Load data from local storage on mount
  useEffect(() => {
    const loadData = async () => {
      // Load allowed CPFs
      const storedCPFs = localStorage.getItem(ALLOWED_CPFS_KEY)
      if (storedCPFs) {
        setAllowedCPFs(JSON.parse(storedCPFs, (key, value) => {
          if (key === "createdAt" || key === "updatedAt") return new Date(value)
          return value
        }))
      } else {
        const cpfs = await adminService.getAllowedCPFs()
        setAllowedCPFs(cpfs)
        localStorage.setItem(ALLOWED_CPFS_KEY, JSON.stringify(cpfs))
      }

      // Load access logs
      const storedLogs = localStorage.getItem(ACCESS_LOGS_KEY)
      if (storedLogs) {
        setAccessLogs(JSON.parse(storedLogs, (key, value) => {
          if (key === "timestamp") return new Date(value)
          return value
        }))
      } else {
        const logs = await adminService.getAccessLogs()
        setAccessLogs(logs)
        localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(logs))
      }

      // Load system metrics
      const metrics = await adminService.getSystemMetrics()
      setSystemMetrics(metrics)
    }

    loadData()
  }, [tenantSlug])

  const addCPF = async (newUser: AllowedCPF) => {
    await adminService.addAllowedCPF(newUser.cpf, newUser.name, newUser.isAdmin, newUser.email)
    const updatedCPFs = [...allowedCPFs, newUser]
    setAllowedCPFs(updatedCPFs)
    localStorage.setItem(ALLOWED_CPFS_KEY, JSON.stringify(updatedCPFs))

    // Log the action
    const newLog: AccessLog = {
      id: `${Date.now()}`,
      cpf: newUser.cpf,
      name: newUser.name,
      action: "User Added",
      timestamp: new Date(),
      success: true,
    }
    const updatedLogs = [...accessLogs, newLog]
    setAccessLogs(updatedLogs)
    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(updatedLogs))
  }

  const removeCPF = async (cpf: string) => {
    await adminService.removeAllowedCPF(cpf)
    const updatedCPFs = allowedCPFs.filter((user) => user.cpf !== cpf)
    setAllowedCPFs(updatedCPFs)
    localStorage.setItem(ALLOWED_CPFS_KEY, JSON.stringify(updatedCPFs))

    // Log the action
    const user = allowedCPFs.find((u) => u.cpf === cpf)
    const newLog: AccessLog = {
      id: `${Date.now()}`,
      cpf,
      name: user?.name || "Unknown",
      action: "User Removed",
      timestamp: new Date(),
      success: true,
    }
    const updatedLogs = [...accessLogs, newLog]
    setAccessLogs(updatedLogs)
    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(updatedLogs))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <Shield className="h-6 w-6 text-red-500" />
        </div>
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
          <UserManagement allowedCPFs={allowedCPFs} addCPF={addCPF} removeCPF={removeCPF} />
        </TabsContent>
        <TabsContent value="expired_jobs" className="space-y-6">
          <ExpiredJobs />
        </TabsContent>
        <TabsContent value="audit_logs" className="space-y-6">
          <AuditLogs accessLogs={accessLogs} allowedCPFs={allowedCPFs} />
        </TabsContent>
        <TabsContent value="support" className="space-y-6">
          <Support />
        </TabsContent>
        <TabsContent value="system_settings" className="space-y-6">
          <SystemSettings systemMetrics={systemMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  )
}