"use client"

import { useState, useEffect } from "react"
import { Check, Copy, Share2, KeyRound } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Switch } from "@/shared/components/ui/switch"
import { toast } from "@/shared/components/ui/use-toast"
import { generateShareableLinkAction } from "@/infrastructure/actions/share-actions";
import { getSystemSettingsAction } from "@/infrastructure/actions/admin-actions";
import { ISystemSettings } from "@/domain/models/SystemSettings";
import { IShareDialogProps } from "../types/types/component-props"


/**
 * Componente de diálogo para compartilhamento de recursos.
 * 
 * @component
 * @description
 * Renderiza um diálogo que permite compartilhar diferentes tipos de recursos (vagas, etc)
 * com opções de configuração como proteção por senha, tempo de expiração e visibilidade.
 * 
 * @param {object} props - Propriedades do componente
 * @param {string} props.title - Título do diálogo
 * @param {string} props.resourceType - Tipo do recurso ('job' ou outros tipos)
 * @param {string} props.resourceId - ID único do recurso
 * @param {string} props.resourceName - Nome do recurso para exibição
 * @param {string} props.tenantSlug - Slug do tenant (necessário para compartilhamento de vagas)
 * @param {string} props.jobSlug - Slug da vaga (opcional)
 * 
 * @states
 * - copied: Controla o estado de feedback da cópia do link
 * - isPublic: Define se o acesso ao recurso será público
 * - expiryDays: Número de dias até a expiração do link
 * - shareUrl: URL gerada para compartilhamento
 * - password: Senha para proteção do recurso (opcional)
 * - isPasswordProtected: Define se o recurso terá proteção por senha
 * 
 * @behavior
 * - Gera URLs diferentes baseadas no tipo de recurso:
 *   - Para vagas (job): /public/{tenantSlug}/jobs
 *   - Para outros recursos: /public/{resourceType}/{hash}
 * - O hash é gerado usando btoa() com resourceType, resourceId, timestamp e indicador de senha
 * - Armazena senhas no localStorage quando habilitado
 * - Permite copiar o link para clipboard com feedback visual
 * 
 * @integration
 * - Utiliza componentes UI do design system (Button, Dialog, Switch, etc)
 * - Depende do sistema de toast para notificações
 * - Integra com clipboard API do navegador
 * - Utiliza localStorage para persistência de senhas
 * 
 * @example
 * ```tsx
 * <ShareDialog 
 *   title="Compartilhar Vaga"
 *   resourceType="job"
 *   resourceId="123"
 *   resourceName="Desenvolvedor Frontend"
 *   tenantSlug="empresa-xyz"
 * />
 * ```
 */
export function ShareDialog({ title, resourceType, resourceId, resourceName, tenantSlug }: IShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [systemSettings, setSystemSettings] = useState<ISystemSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const result = await getSystemSettingsAction();
      if (result.success && result.data) {
        setSystemSettings(result.data.settings);
        setIsPasswordProtected(result.data.settings.requirePasswordForPublicLinks || false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Generate a temporary URL for display while the actual link is not created
    if (resourceType === "job" && tenantSlug) {
      setShareUrl(`${window.location.origin}/public/${tenantSlug}/jobs`);
    } else if (resourceType === "dashboard" && tenantSlug) {
      setShareUrl(`${window.location.origin}/public/${tenantSlug}/dashboard`);
    } else {
      setShareUrl(`${window.location.origin}/public/shared-resource`); // Generic placeholder
    }
  }, [resourceType, tenantSlug]);

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copiado!",
        description: "O link de compartilhamento foi copiado para a área de transferência.",
      });
    }
  };

  const handleShare = async () => {
    setIsCreatingLink(true);
    try {
      const expiresAt = systemSettings?.defaultLinkExpirationDays === 0 ? undefined : (systemSettings?.defaultLinkExpirationDays ? new Date(Date.now() + systemSettings.defaultLinkExpirationDays * 24 * 60 * 60 * 1000) : undefined);
      const options = {
        expiresAt,
        password: isPasswordProtected ? password : undefined,
      };

      const result = await generateShareableLinkAction(
        resourceType,
        resourceId,
        resourceName,
        options
      );

      if (result.success && result.data) {
        const finalShareUrl = `${window.location.origin}/share/${result.data.hash}`;
        setShareUrl(finalShareUrl);
        navigator.clipboard.writeText(finalShareUrl); // Copy to clipboard
        window.open(finalShareUrl, '_blank'); // Open in new tab
        toast({
          title: "Link compartilhado!",
          description: `${resourceName} agora está ${result.data.passwordHash ? "protegido por senha" : ""}. Expiração definida pelas configurações do sistema.`,
        });
      } else {
        toast({
          title: "Erro ao Compartilhar",
          description: result.error || "Não foi possível criar o link de compartilhamento.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro Inesperado",
        description: error.message || "Ocorreu um erro inesperado ao compartilhar o recurso.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLink(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {resourceType === "job"
              ? "Compartilhe este link para que candidatos vejam as vagas disponíveis e se candidatem."
              : "Compartilhe este link com qualquer pessoa para dar acesso a este recurso."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" value={shareUrl} readOnly placeholder="Gerando link..." />
          </div>
        </div>

        {systemSettings && (
          <div className="text-sm text-muted-foreground mt-2">
            Este link irá expirar em:
            {systemSettings.defaultLinkExpirationDays === 0
              ? " Nunca"
              : ` ${systemSettings.defaultLinkExpirationDays} dia(s)`}
          </div>
        )}

        <div className="space-y-3 mt-4">
            <div className="flex items-center space-x-2">
              <Switch id="password-protect" checked={isPasswordProtected} onCheckedChange={setIsPasswordProtected} />
              <Label htmlFor="password-protect">Proteger com senha</Label>
            </div>
            {isPasswordProtected && (
              <div className="grid gap-2">
                <Label htmlFor="share-password">Senha de Acesso</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="share-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Defina uma senha"
                    className="pl-8"
                  />
                </div>
              </div>
            )}
          </div>

        
        <DialogFooter className="mt-6">
          <Button type="submit" onClick={handleShare} disabled={!shareUrl || (isPasswordProtected && !password) || isCreatingLink}>
            {isCreatingLink ? "Gerando Link..." : "Confirmar compartilhamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
