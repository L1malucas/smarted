"use client"

import { useState, useEffect, useTransition } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Download, Eye, Star, Loader2, Badge } from "lucide-react"
import Link from "next/link"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { getJobDetailsAction, getCandidatesForJobAction } from "@/infrastructure/actions/job-actions"
import { ShareDialog } from "@/shared/components/share-dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { toast } from "@/shared/hooks/use-toast"
import { Job, Candidate } from "@/shared/types/types/jobs-interface"
import { Button } from "@/shared/components/ui/button"


export default function CandidatesPage() {
  const params = useParams();
  const tenantSlug = params.slug as string;
  const jobId = params.jobId as string; // Assuming this is the job's ID

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      startTransition(async () => {
        try {
          const jobResult = await getJobDetailsAction(jobId);
          if (jobResult.success && jobResult.data) {
            setJob(jobResult.data);
          } else {
            toast({
              title: "Erro",
              description: jobResult.error || "Vaga não encontrada.",
              variant: "destructive",
            });
            setJob(null); // Ensure job is null on error
          }

          const candidatesResult = await getCandidatesForJobAction(jobId);
          if (candidatesResult.success && candidatesResult.data) {
            setCandidates(candidatesResult.data);
          } else {
            toast({
              title: "Erro",
              description: candidatesResult.error || "Não foi possível carregar os candidatos.",
              variant: "destructive",
            });
            setCandidates([]); // Ensure candidates is empty on error
          }
        } catch (error) {
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os detalhes da vaga ou candidatos.",
            variant: "destructive",
          });
          setJob(null);
          setCandidates([]);
        } finally {
          setIsLoading(false);
        }
      });
    };

    fetchData();
  }, [jobId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-900/20 text-green-500">Excelente</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-900/20 text-yellow-500">Bom</Badge>;
    return <Badge className="bg-red-900/20 text-red-500">Regular</Badge>;
  };

  // Default radar data if no candidates or analysis
  const defaultRadarData = [
    { subject: "Experiência", A: 0, fullMark: 100 },
    { subject: "Habilidades", A: 0, fullMark: 100 },
    { subject: "Certificações", A: 0, fullMark: 100 },
    { subject: "Comportamental", A: 0, fullMark: 100 },
    { subject: "Liderança", A: 0, fullMark: 100 },
  ];

  // Calculate radar data based on candidates (if any)
  const currentRadarData = candidates.length > 0 ? [
    { subject: "Experiência", A: candidates.reduce((sum, c) => sum + (c.analysis?.experienceScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Habilidades", A: candidates.reduce((sum, c) => sum + (c.analysis?.skillsScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Certificações", A: candidates.reduce((sum, c) => sum + (c.analysis?.certificationsScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Comportamental", A: candidates.reduce((sum, c) => sum + (c.analysis?.behavioralScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Liderança", A: candidates.reduce((sum, c) => sum + (c.analysis?.leadershipScore || 0), 0) / candidates.length, fullMark: 100 },
  ] : defaultRadarData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-12">Vaga não encontrada.</div>;
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
          <h1 className="text-3xl font-bold">Ranking de Candidatos para: {job.title}</h1>
          <p className="text-muted-foreground">Análise de currículos por IA</p>
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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Candidatos Ranqueados</h2>
          <div className="flex gap-2">
            <ShareDialog
              title="Compartilhar Ranking de Candidatos"
              resourceType="candidates"
              resourceId={jobId}
              resourceName={`Ranking de Candidatos - ${job.title}`}
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

        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum candidato encontrado para esta vaga.</p>
          </div>
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

                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/${tenantSlug}/candidate/${candidate._id}?jobId=${jobId}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}