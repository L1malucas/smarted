"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Eye, Star } from "lucide-react"
import Link from "next/link"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { ShareDialog } from "@/components/share-dialog"

const mockCandidates = [
  {
    _id: "1",
    name: "Ana Silva",
    email: "ana.silva@email.com",
    fileName: "curriculo-ana-silva.pdf",
    analysis: {
      experienceScore: 85,
      skillsScore: 92,
      certificationsScore: 78,
      behavioralScore: 88,
      leadershipScore: 75,
      finalScore: 85.6,
      comments: {
        experience: "5+ anos em React e TypeScript, experiência sólida em projetos complexos",
        skills: "Domínio avançado em React, TypeScript, Node.js e ferramentas modernas",
        certifications: "Certificações AWS e Google Cloud, cursos especializados em frontend",
      },
    },
  },
  {
    _id: "2",
    name: "Carlos Santos",
    email: "carlos.santos@email.com",
    fileName: "curriculo-carlos-santos.pdf",
    analysis: {
      experienceScore: 78,
      skillsScore: 85,
      certificationsScore: 82,
      behavioralScore: 79,
      leadershipScore: 88,
      finalScore: 82.4,
      comments: {
        experience: "4 anos de experiência, projetos variados em diferentes tecnologias",
        skills: "Bom conhecimento em React, Vue.js e Angular, versatilidade técnica",
        certifications: "Certificações Microsoft e Scrum Master, formação continuada",
      },
    },
  },
  {
    _id: "3",
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    fileName: "curriculo-maria-oliveira.pdf",
    analysis: {
      experienceScore: 72,
      skillsScore: 88,
      certificationsScore: 65,
      behavioralScore: 85,
      leadershipScore: 70,
      finalScore: 76.8,
      comments: {
        experience: "3 anos de experiência, foco em desenvolvimento frontend moderno",
        skills: "Excelente em React e JavaScript, conhecimento em design systems",
        certifications: "Algumas certificações online, participação em bootcamps",
      },
    },
  },
]

const radarData = [
  { subject: "Experiência", A: 78.3, fullMark: 100 },
  { subject: "Habilidades", A: 88.3, fullMark: 100 },
  { subject: "Certificações", A: 75.0, fullMark: 100 },
  { subject: "Comportamental", A: 84.0, fullMark: 100 },
  { subject: "Liderança", A: 77.7, fullMark: 100 },
]

/**
 * @page CandidatesPage - Página de Ranking de Candidatos
 * @description Exibe o ranking de candidatos para uma vaga específica com análises detalhadas por IA
 * 
 * @component
 * @implements {React.FC}
 * 
 * @dependencies
 * - useParams - Hook para acessar parâmetros da URL
 * - Link - Componente de navegação
 * - Button, Card, Select etc - Componentes UI
 * - ResponsiveContainer, RadarChart etc - Componentes de visualização de dados
 * 
 * @hooks
 * - useState - Gerencia o estado da vaga selecionada
 * 
 * @param {Object} params - Parâmetros da URL
 * @param {string} params.slug - Slug do tenant atual
 * @param {string} params.jobId - ID ou slug da vaga
 * 
 * @flow
 * 1. Recupera parâmetros da URL (tenant e jobId)
 * 2. Gerencia seleção de vaga via estado
 * 3. Renderiza interface com:
 *    - Cabeçalho com navegação
 *    - Seletor de vaga
 *    - Gráfico radar com médias
 *    - Lista de candidatos ranqueados
 * 
 * @features
 * - Filtragem por vaga
 * - Visualização de scores em gráfico radar
 * - Ranking detalhado de candidatos
 * - Exportação de dados (PDF/Excel)
 * - Compartilhamento de ranking
 * 
 * @utilities
 * - getScoreColor - Define cor baseada no score
 * - getScoreBadge - Retorna badge visual baseado no score
 * 
 * @visualComponents
 * - Scores são apresentados com código de cores (verde/amarelo/vermelho)
 * - Cards individuais por candidato mostram:
 *   - Posição no ranking
 *   - Informações básicas
 *   - Scores detalhados
 *   - Comentários da análise
 *   - Ações disponíveis
 * 
 * @integration
 * - Requer dados de candidatos (atualmente mockados)
 * - Integra com sistema de compartilhamento via ShareDialog
 * - Prepara dados para exportação PDF/Excel
 * 
 * @customization
 * Para adicionar novos critérios de avaliação:
 * 1. Adicionar novo score no tipo de análise
 * 2. Incluir visualização no grid de scores
 * 3. Atualizar dados do gráfico radar
 * 
 * Para modificar classificações:
 * - Ajustar thresholds em getScoreColor e getScoreBadge
 * 
 * @related
 * - ShareDialog
 * - Página de detalhes do candidato
 * - Sistema de análise por IA
 */
export default function CandidatesPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const jobSlugParam = params.jobId as string // Assuming this is the job's slug or ID
  const [selectedJob, setSelectedJob] = useState("desenvolvedor-frontend-senior")

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${tenantSlug}/jobs`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ranking de Candidatos</h1>
          <p className="text-muted-foreground">Análise de currículos por IA</p>
        </div>
      </div>

      {/* Seletor de Vaga */}
      <Card>
        <CardHeader>
          <CardTitle>Vaga Selecionada</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desenvolvedor-frontend-senior">Desenvolvedor Frontend Sênior</SelectItem>
              <SelectItem value="analista-dados-junior">Analista de Dados Júnior</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Gráfico Radar - Médias */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Geral dos Candidatos</CardTitle>
          <CardDescription>Médias dos scores por critério</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Candidatos Ranqueados</h2>
          <div className="flex gap-2">
            <ShareDialog
              title="Compartilhar Ranking de Candidatos"
              resourceType="candidates"
              resourceId={jobSlugParam}
              resourceName="Ranking de Candidatos - Desenvolvedor Frontend Sênior"
              tenantSlug={tenantSlug}
            />
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {mockCandidates.map((candidate, index) => (
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

              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
