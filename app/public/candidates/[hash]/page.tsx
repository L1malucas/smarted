"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { candidatesService } from "@/services/candidates"
import { JobService } from "@/services/jobs"

interface PublicCandidate {
  _id: string
  name: string
  email: string
  analysis: {
    experienceScore: number
    skillsScore: number
    certificationsScore: number
    behavioralScore: number
    leadershipScore: number
    finalScore: number
    comments: {
      experience: string
      skills: string
      certifications: string
    }
  }
}

const radarData = [
  { subject: "Experiência", A: 78.3, fullMark: 100 },
  { subject: "Habilidades", A: 88.3, fullMark: 100 },
  { subject: "Certificações", A: 75.0, fullMark: 100 },
  { subject: "Comportamental", A: 84.0, fullMark: 100 },
  { subject: "Liderança", A: 77.7, fullMark: 100 },
]

/**
 * @page PublicCandidatesPage
 * @description Página pública para visualização de candidatos ranqueados para uma vaga específica
 * 
 * @component
 * @public
 * 
 * @remarks
 * Esta página é acessível publicamente através de um hash único e exibe:
 * - Título da vaga
 * - Gráfico radar com médias gerais
 * - Lista de candidatos ordenada por pontuação
 * 
 * @dependencies
 * - useParams - Para capturar o hash da URL
 * - useState - Gerenciamento de estado dos candidatos, título da vaga, loading e erros
 * - useEffect - Efeito para carregar dados dos candidatos
 * - RadarChart - Componente para visualização gráfica das médias
 * - Card, Badge - Componentes UI
 * 
 * @states
 * - candidates: PublicCandidate[] - Lista de candidatos com suas análises
 * - jobTitle: string - Título da vaga em questão
 * - loading: boolean - Estado de carregamento da página
 * - error: string | null - Mensagem de erro, se houver
 * 
 * @functions
 * - fetchCandidates() - Função assíncrona que busca os dados dos candidatos
 *   Atualmente usando dados mockados, deve ser substituída por chamada real à API
 * 
 * - getScoreColor(score: number) - Retorna classe CSS de cor baseada na pontuação
 *   >= 80: verde
 *   >= 60: amarelo
 *   < 60: vermelho
 * 
 * - getScoreBadge(score: number) - Retorna componente Badge com status baseado na pontuação
 *   >= 80: Excelente
 *   >= 60: Bom
 *   < 60: Regular
 * 
 * @visualElements
 * - Loading: Skeleton components para loading state
 * - Error: Card com mensagem de erro
 * - Main Content:
 *   1. Cabeçalho com título e informações da vaga
 *   2. Gráfico radar com médias gerais
 *   3. Lista de candidatos com scores e comentários
 *   4. Footer com mensagem informativa
 * 
 * @extensionPoints
 * - Implementação real do fetchCandidates com chamada à API
 * - Adição de filtros e ordenação
 * - Expansão dos critérios de avaliação
 * - Implementação de interatividade para usuários logados
 * 
 * @securityConsiderations
 * - Página é pública mas requer hash válido
 * - Dados sensíveis devem ser filtrados no backend
 * - Considerar implementação de rate limiting
 * 
 * @related
 * - Componente deve se integrar com API de candidatos
 * - Sistema de autenticação para funcionalidades extras
 * - Sistema de compartilhamento de links públicos
 */
export default function PublicCandidatesPage() {
  const params = useParams()
  const [candidates, setCandidates] = useState<PublicCandidate[]>([])
  const [jobTitle, setJobTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)
        // In a real implementation, this would fetch the candidates data from the API
        // using the hash parameter to identify the shared resource
        await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

        // For now, return empty data
        setJobTitle("N/A")
        setCandidates([])
        setError(null)
      } catch (err) {
        setError(
          "Não foi possível carregar os dados dos candidatos. O link pode ter expirado ou o recurso não existe mais.",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [params.hash])

  const defaultRadarData = [
    { subject: "Experiência", A: 0, fullMark: 100 },
    { subject: "Habilidades", A: 0, fullMark: 100 },
    { subject: "Certificações", A: 0, fullMark: 100 },
    { subject: "Comportamental", A: 0, fullMark: 100 },
    { subject: "Liderança", A: 0, fullMark: 100 },
  ];

  const currentRadarData = candidates.length > 0 ? [
    { subject: "Experiência", A: candidates.reduce((sum, c) => sum + (c.analysis?.experienceScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Habilidades", A: candidates.reduce((sum, c) => sum + (c.analysis?.skillsScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Certificações", A: candidates.reduce((sum, c) => sum + (c.analysis?.certificationsScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Comportamental", A: candidates.reduce((sum, c) => sum + (c.analysis?.behavioralScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Liderança", A: candidates.reduce((sum, c) => sum + (c.analysis?.leadershipScore || 0), 0) / candidates.length, fullMark: 100 },
  ] : defaultRadarData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-900/20 text-green-500">Excelente</Badge>
    if (score >= 60) return <Badge className="bg-yellow-900/20 text-yellow-500">Bom</Badge>
    return <Badge className="bg-red-900/20 text-red-500">Regular</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao carregar</CardTitle>
          <CardDescription>Não foi possível acessar este recurso</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ranking de Candidatos</h1>
        <p className="text-muted-foreground">Vaga: {jobTitle || "N/A"}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">
            Compartilhado publicamente • Visualização somente leitura
          </span>
        </div>
      </div>

      {/* Gráfico Radar - Médias */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Geral dos Candidatos</CardTitle>
          <CardDescription>Médias dos scores por critério</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={currentRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Média" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Candidatos Ranqueados</h2>

        {candidates.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum candidato encontrado para esta vaga.</p>
        ) : (
          candidates.map((candidate, index) => (
            <Card key={candidate._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-900/20 text-blue-500 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(candidate.analysis.finalScore)}`}>
                        {candidate.analysis.finalScore.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        {getScoreBadge(candidate.analysis.finalScore)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis.experienceScore)}`}>
                      {candidate.analysis.experienceScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Experiência</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis.skillsScore)}`}>
                      {candidate.analysis.skillsScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Habilidades</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis.certificationsScore)}`}>
                      {candidate.analysis.certificationsScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Certificações</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis.behavioralScore)}`}>
                      {candidate.analysis.behavioralScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Comportamental</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis.leadershipScore)}`}>
                      {candidate.analysis.leadershipScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Liderança</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <strong>Experiência:</strong> {candidate.analysis.comments.experience}
                  </div>
                  <div className="text-sm">
                    <strong>Habilidades:</strong> {candidate.analysis.comments.skills}
                  </div>
                  <div className="text-sm">
                    <strong>Certificações:</strong> {candidate.analysis.comments.certifications}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Este é um link de visualização pública. Para interagir com estes dados, faça login no sistema.</p>
      </div>
    </div>
  )
}
