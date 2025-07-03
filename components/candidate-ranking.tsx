"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Star } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { ShareDialog } from "@/components/share-dialog"
import type { Candidate } from "@/types"

import { CandidateRankingProps } from "@/types/component-props"

/**
 * Componente que exibe o ranking de candidatos para uma vaga específica.
 * 
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Candidate[]} props.candidates - Array de candidatos a serem exibidos no ranking
 * @param {string} props.jobTitle - Título da vaga
 * @param {string} props.jobId - ID único da vaga
 * @param {string} props.tenantSlug - Slug do tenant (empresa/organização)
 * @param {RadarData[]} props.radarData - Dados para o gráfico radar de médias dos scores
 * 
 * @remarks
 * Este componente é responsável por:
 * - Exibir um gráfico radar com as médias dos scores por critério de todos os candidatos
 * - Listar os candidatos ordenados por ranking, mostrando:
 *   - Score final e classificação (Excelente, Bom, Regular)
 *   - Scores individuais (Experiência, Habilidades, Certificações, Comportamental, Liderança)
 *   - Comentários da análise
 *   - Opções de visualização detalhada e download
 * 
 * @example
 * ```tsx
 * <CandidateRanking 
 *   candidates={candidatesList}
 *   jobTitle="Desenvolvedor Frontend"
 *   jobId="123"
 *   tenantSlug="empresa-abc"
 *   radarData={analysisData}
 * />
 * ```
 * 
 * @internal
 * O componente utiliza as seguintes funções auxiliares:
 * - getScoreColor: Define a cor do texto baseado no score (verde, amarelo ou vermelho)
 * - getScoreBadge: Retorna um componente Badge com estilo e texto baseado no score
 * 
 * @see ShareDialog - Componente utilizado para compartilhamento do ranking
 * @see Badge - Componente de badge utilizado para classificação
 * @see RadarChart - Componente do recharts para renderização do gráfico radar
 */
export function CandidateRanking({ candidates, jobTitle, jobId, tenantSlug, radarData }: CandidateRankingProps) {
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
              resourceId={jobId}
              resourceName={`Ranking de Candidatos - ${jobTitle}`}
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

        {candidates.map((candidate, index) => (
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
                    <div className={`text-2xl font-bold ${getScoreColor(candidate.analysis?.finalScore || 0)}`}>
                      {(candidate.analysis?.finalScore || 0).toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      {getScoreBadge(candidate.analysis?.finalScore || 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis?.experienceScore || 0)}`}>
                    {candidate.analysis?.experienceScore || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Experiência</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis?.skillsScore || 0)}`}>
                    {candidate.analysis?.skillsScore || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Habilidades</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-lg font-semibold ${getScoreColor(candidate.analysis?.certificationsScore || 0)}`}
                  >
                    {candidate.analysis?.certificationsScore || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Certificações</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis?.behavioralScore || 0)}`}>
                    {candidate.analysis?.behavioralScore || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Comportamental</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getScoreColor(candidate.analysis?.leadershipScore || 0)}`}>
                    {candidate.analysis?.leadershipScore || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Liderança</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <strong>Experiência:</strong> {candidate.analysis?.comments.experience}
                </div>
                <div className="text-sm">
                  <strong>Habilidades:</strong> {candidate.analysis?.comments.skills}
                </div>
                <div className="text-sm">
                  <strong>Certificações:</strong> {candidate.analysis?.comments.certifications}
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
