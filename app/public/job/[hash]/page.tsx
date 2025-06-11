 "use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, Users, KeyRound } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface PublicJob {
  _id: string
  slug: string
  title: string
  description: string
  criteriaWeights: {
    experience: number
    skills: number
    certifications: number
    behavioral: number
    leadership: number
  }
  status: "draft" | "active" | "closed"
  candidatesCount: number
  createdAt: Date
  isPasswordProtected?: boolean // Flag from shared link data (mocked)
  // expiryTimestamp?: number; // For frontend expiry check
}

/**
 * @page PublicJobPage
 * @description Página pública para visualização de vagas compartilhadas, com suporte a proteção por senha.
 * 
 * @component PublicJobPage
 * @returns {JSX.Element} Renderiza a interface da vaga compartilhada
 * 
 * @state
 * - job: {PublicJob | null} Armazena os dados da vaga
 * - loading: {boolean} Controla o estado de carregamento
 * - error: {string | null} Armazena mensagens de erro
 * - isAuthenticated: {boolean} Indica se o usuário está autenticado para ver a vaga
 * - passwordAttempt: {string} Armazena a tentativa de senha do usuário
 * - showPasswordPrompt: {boolean} Controla a exibição do prompt de senha
 * 
 * @hooks
 * - useEffect: Realiza o fetch inicial dos dados da vaga
 * - useParams: Obtém o hash da URL para identificar a vaga
 * 
 * @flow
 * 1. Obtém o hash da URL
 * 2. Carrega os dados da vaga (mockado)
 * 3. Verifica se a vaga é protegida por senha
 * 4. Se protegida, exibe prompt de senha
 * 5. Após autenticação, exibe os detalhes da vaga
 * 
 * @authentication
 * - Utiliza localStorage para simular proteção por senha
 * - Chave `share_pwd_${hash}` armazena a senha da vaga
 * - Chave `share_info_${hash}` pode armazenar informações adicionais (como expiração)
 * 
 * @displays
 * - Loading: Skeleton loader durante carregamento
 * - Error: Card de erro para problemas de acesso
 * - Password Prompt: Formulário de senha para vagas protegidas
 * - Job Details: Detalhes completos da vaga após autenticação
 * 
 * @layout
 * - Cabeçalho com título e status
 * - Descrição da vaga
 * - Métricas (data, candidatos, ID)
 * - Critérios de avaliação com pesos visuais
 * 
 * @integration
 * - Substituir mock por chamada API real
 * - Implementar verificação de expiração do compartilhamento
 * - Integrar com sistema de autenticação real
 * 
 * @customization
 * Para adicionar novas funcionalidades:
 * 1. Expandir interface PublicJob para novos campos
 * 2. Adicionar novos estados se necessário
 * 3. Implementar novas seções no layout de detalhes
 * 4. Considerar implementar sistema de cache para dados
 * 
 * @dependencies
 * - shadcn/ui para componentes de UI
 * - lucide-react para ícones
 * - next/navigation para useParams
 * 
 * @security
 * - Implementar rate limiting para tentativas de senha
 * - Adicionar expiração de compartilhamento
 * - Sanitizar dados da API
 * - Implementar proteção contra força bruta
 */
export default function PublicJobPage() {
  const params = useParams()
  const hash = params.hash as string // Get hash from URL

  const [job, setJob] = useState<PublicJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordAttempt, setPasswordAttempt] = useState("")
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API

        // Mock data - in real app, fetch by hash and check password protection status
        const mockJobData: PublicJob = {
          _id: "1",
          slug: "desenvolvedor-frontend-senior",
          title: "Desenvolvedor Frontend Sênior (Compartilhado)",
          description: "Buscamos um desenvolvedor frontend experiente para liderar projetos em React e TypeScript...",
          criteriaWeights: { experience: 30, skills: 30, certifications: 15, behavioral: 15, leadership: 10 },
          status: "active",
          candidatesCount: 23,
          createdAt: new Date("2024-01-15"),
          isPasswordProtected: localStorage.getItem(`share_pwd_${hash}`) !== null, // Check if password was set
        }

        // Frontend Expiry Check (Example)
        // const sharedItem = JSON.parse(localStorage.getItem(`share_info_${hash}`) || "{}");
        // if (sharedItem.expiryTimestamp && Date.now() > sharedItem.expiryTimestamp) {
        //   setError("Este link de compartilhamento expirou.");
        //   setLoading(false);
        //   return;
        // }

        setJob(mockJobData)

        if (mockJobData.isPasswordProtected) {
          setShowPasswordPrompt(true)
        } else {
          setIsAuthenticated(true)
        }
        setError(null)
      } catch (err) {
        console.error("Error fetching job:", err)
        setError("Não foi possível carregar os dados da vaga.")
      } finally {
        setLoading(false)
      }
    }

    if (hash) {
      fetchJob()
    }
  }, [hash])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const storedPassword = localStorage.getItem(`share_pwd_${hash}`)
    if (job?.isPasswordProtected && passwordAttempt === storedPassword) {
      setIsAuthenticated(true)
      setShowPasswordPrompt(false)
      setError(null)
    } else {
      setError("Senha incorreta. Tente novamente.")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
        </div>
      </div>
    )
  }

  if (error && !isAuthenticated) {
    // Show error only if not authenticated (e.g. wrong password)
    return (
      <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle>Erro ao Acessar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          {showPasswordPrompt && ( // If error was due to wrong password, re-show prompt
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="password">Senha de Acesso</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={passwordAttempt}
                    onChange={(e) => setPasswordAttempt(e.target.value)}
                    required
                    className="pl-8"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Acessar Vaga
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    )
  }

  if (showPasswordPrompt && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Acesso Protegido</CardTitle>
            <CardDescription>
              Esta vaga é protegida por senha. Por favor, insira a senha para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Senha de Acesso</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={passwordAttempt}
                    onChange={(e) => setPasswordAttempt(e.target.value)}
                    required
                    className="pl-8"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Acessar Vaga
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job || !isAuthenticated) {
    // This case handles if job is null after loading & auth checks, or if not authenticated for other reasons
    return (
      <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle>Recurso não encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>O link pode estar incorreto ou o recurso não está mais disponível.</p>
        </CardContent>
      </Card>
    )
  }

  // Render job details if authenticated
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={job.status === "active" ? "default" : job.status === "draft" ? "secondary" : "destructive"}>
            {job.status === "active" ? "Ativa" : job.status === "draft" ? "Rascunho" : "Fechada"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Compartilhado publicamente • Visualização somente leitura
          </span>
        </div>
      </div>
      {/* ... rest of the job detail rendering from previous version ... */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição da Vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{job.description}</p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Criada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{job.candidatesCount} candidatos</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">ID: {job.slug}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Critérios de Avaliação</CardTitle>
          <CardDescription>Pesos utilizados para avaliar os candidatos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Experiência</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.experience}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights.experience}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Habilidades</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.skills}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${job.criteriaWeights.skills}%` }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Certificações</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.certifications}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights.certifications}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Comportamental</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.behavioral}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights.behavioral}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Liderança</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.leadership}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights.leadership}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Este é um link de visualização pública. Para interagir com esta vaga, faça login no sistema.</p>
      </div>
    </div>
  )
}
