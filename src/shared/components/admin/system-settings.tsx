// components/admin/SystemSettings.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Button } from "../ui/button";
import { toast } from "@/shared/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/infrastructure/actions/admin-actions";
import { ISystemMetrics } from "@/shared/types/types/dashboard-interface";

export default function SystemSettings() {
  const [companyName, setCompanyName] = useState("");
  const [defaultJobLimit, setDefaultJobLimit] = useState<number>(0);
  const [defaultLinkExpirationDays, setDefaultLinkExpirationDays] = useState<number | undefined>(undefined);
  const [requirePasswordForPublicLinks, setRequirePasswordForPublicLinks] = useState<boolean>(false);
  const [maxLinkViews, setMaxLinkViews] = useState<number | undefined>(undefined);
  const [systemMetrics, setSystemMetrics] = useState<ISystemMetrics | null>(null); // To store fetched metrics
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
          setDefaultLinkExpirationDays(result.data.settings.defaultLinkExpirationDays);
          setRequirePasswordForPublicLinks(result.data.settings.requirePasswordForPublicLinks || false);
          setMaxLinkViews(result.data.settings.maxLinkViews);
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
        defaultLinkExpirationDays,
        requirePasswordForPublicLinks,
        maxLinkViews,
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
          <div className="space-y-2">
            <Label htmlFor="defaultLinkExpirationDays">Expiração Padrão de Links (dias)</Label>
            <select
              id="defaultLinkExpirationDays"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={defaultLinkExpirationDays || '0'}
              onChange={(e) => setDefaultLinkExpirationDays(Number(e.target.value))}
            >
              <option value="0">Nunca</option>
              <option value="1">1 dia</option>
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxLinkViews">Máximo de Visualizações por Link</Label>
            <Input
              id="maxLinkViews"
              type="number"
              value={maxLinkViews || ''}
              onChange={(e) => setMaxLinkViews(Number(e.target.value) || undefined)}
              placeholder="Ex: 100 (visualizações)"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="requirePasswordForPublicLinks"
              checked={requirePasswordForPublicLinks}
              onCheckedChange={setRequirePasswordForPublicLinks}
            />
            <Label htmlFor="requirePasswordForPublicLinks">Exigir Senha para Links Públicos</Label>
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