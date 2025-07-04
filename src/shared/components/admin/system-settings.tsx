// components/admin/SystemSettings.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Button } from "../ui/button";
import { toast } from "@/shared/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "postcss";
import { Label } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function SystemSettings() {
  const [companyName, setCompanyName] = useState("");
  const [defaultJobLimit, setDefaultJobLimit] = useState<number>(0);
  const [systemMetrics, setSystemMetrics] = useState<any>(null); // To store fetched metrics
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getSystemSettingsAction();
        if (result.success && result.data) {
          setCompanyName(result.data.settings.companyName || "");
          setDefaultJobLimit(result.data.settings.defaultJobLimit || 0);
          setSystemMetrics(result.data.settings.systemMetrics || null); // Assuming metrics are part of settings
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível carregar as configurações do sistema.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      });
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    startTransition(async () => {
      const settingsToSave = {
        companyName,
        defaultJobLimit,
      };
      const result = await updateSystemSettingsAction(settingsToSave);
      if (result.success) {
        toast({
          title: "Configurações Salvas",
          description: "As configurações do sistema foram atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao Salvar",
          description: result.error || "Não foi possível salvar as configurações do sistema.",
          variant: "destructive",
        });
      }
      setIsSaving(false);
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="mt-8 space-y-2 border-t pt-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nome da sua empresa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultJobLimit">Limite Padrão de Vagas</Label>
            <Input
              id="defaultJobLimit"
              type="number"
              value={defaultJobLimit}
              onChange={(e) => setDefaultJobLimit(Number(e.target.value))}
              placeholder="Ex: 10"
            />
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>

        {systemMetrics && (
          <div className="mt-8 space-y-2 border-t pt-4">
            <h3 className="text-lg font-semibold">Métricas do Sistema</h3>
            <p><strong>Total de Usuários:</strong> {systemMetrics.totalUsers}</p>
            <p><strong>Usuários Ativos:</strong> {systemMetrics.activeUsers}</p>
            <p><strong>Total de Vagas:</strong> {systemMetrics.totalJobs}</p>
            <p><strong>Total de Candidatos:</strong> {systemMetrics.totalCandidates}</p>
            <p><strong>Uptime do Sistema:</strong> {systemMetrics.systemUptime}</p>
            <p><strong>Tempo Médio de Resposta:</strong> {systemMetrics.avgResponseTime}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}