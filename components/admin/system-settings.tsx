// components/admin/SystemSettings.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { SystemMetrics } from "@/types/admin-interface"

interface SystemSettingsProps {
  systemMetrics: SystemMetrics | null
}

// Mock service for system settings
const systemSettingsService = {
  getSettings: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const storedSettings = localStorage.getItem("system_settings");
    return storedSettings ? JSON.parse(storedSettings) : { companyName: "SMARTED TECH SOLUTIONS", defaultJobLimit: 10 };
  },
  saveSettings: async (settings: { companyName: string; defaultJobLimit: number }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem("system_settings", JSON.stringify(settings));
    return settings;
  },
};

export default function SystemSettings({ systemMetrics }: SystemSettingsProps) {
  const [companyName, setCompanyName] = useState("");
  const [defaultJobLimit, setDefaultJobLimit] = useState<number>(10);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await systemSettingsService.getSettings();
      setCompanyName(settings.companyName);
      setDefaultJobLimit(settings.defaultJobLimit);
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await systemSettingsService.saveSettings({ companyName, defaultJobLimit });
      toast({
        title: "Configurações Salvas",
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as configurações do sistema.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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