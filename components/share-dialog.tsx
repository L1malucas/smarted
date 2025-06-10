"use client"

import { useState, useEffect } from "react"
import { Check, Copy, Share2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

interface ShareDialogProps {
  title: string
  resourceType: "job" | "candidates" | "report"
  resourceId: string
  resourceName: string
  tenantSlug?: string
  jobSlug?: string // Para links específicos de vaga
}

export function ShareDialog({ title, resourceType, resourceId, resourceName, tenantSlug, jobSlug }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [expiryDays, setExpiryDays] = useState("7")
  const [shareUrl, setShareUrl] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin

      // Gerar URL específica baseada no tipo de recurso
      if (resourceType === "job" && tenantSlug) {
        // Para vagas, gerar link público que leva à página de vagas do tenant
        setShareUrl(`${baseUrl}/public/${tenantSlug}/jobs`)
      } else {
        // Para outros recursos, manter o padrão existente
        const hashContent = `${resourceType}-${resourceId}-${Date.now()}${password ? `-pwdProtected` : ""}`
        const hash = btoa(hashContent)
        setShareUrl(`${baseUrl}/public/${resourceType}/${hash}`)
      }
    }
  }, [resourceType, resourceId, tenantSlug, password])

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Link copiado!",
        description: "O link de compartilhamento foi copiado para a área de transferência.",
      })
    }
  }

  const handleShare = () => {
    console.log("Sharing:", {
      resourceType,
      resourceId,
      resourceName,
      isPublic,
      expiryDays: Number.parseInt(expiryDays),
      shareUrl,
      isPasswordProtected,
      password: isPasswordProtected ? password : "N/A",
    })

    if (isPasswordProtected && password && shareUrl) {
      const urlParts = shareUrl.split("/")
      const hash = urlParts[urlParts.length - 1]
      localStorage.setItem(`share_pwd_${hash}`, password)
    }

    toast({
      title: "Link compartilhado!",
      description: `${resourceName} agora está ${isPublic ? "publicamente" : "privadamente"} compartilhado ${
        isPasswordProtected ? "com senha" : ""
      }.`,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
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
          <Button size="sm" className="px-3" onClick={copyToClipboard} disabled={!shareUrl}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {resourceType === "job" && (
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
        )}

        <div className="flex items-center space-x-2 mt-4">
          <Label htmlFor="public-access" className="flex-1">
            Acesso público
          </Label>
          <Switch id="public-access" checked={isPublic} onCheckedChange={setIsPublic} />
        </div>
        <div className="grid gap-2 mt-4">
          <Label htmlFor="expiry">Expirar após</Label>
          <select
            id="expiry"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
          >
            <option value="1">1 dia</option>
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
            <option value="0">Nunca</option>
          </select>
        </div>
        <DialogFooter className="mt-6">
          <Button type="submit" onClick={handleShare} disabled={!shareUrl || (isPasswordProtected && !password)}>
            Confirmar compartilhamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
