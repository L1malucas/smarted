"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../ui/button";
import { ArrowLeft, Briefcase, Calendar, Users, Edit, Badge } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { CandidateRanking } from "../candidate-ranking";
import { ShareDialog } from "../share-dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { IJobDetailsProps } from "@/shared/types/types/component-props";

export function JobDetails({ job, candidates, tenantSlug, radarData }: IJobDetailsProps) {
  const [activeTab, setActiveTab] = useState("detalhes")

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberta: { variant: "default", label: "Aberta", className: "bg-sky-500 hover:bg-sky-600" },
      recrutamento: { variant: "default", label: "Recrutamento", className: "bg-blue-500 hover:bg-blue-600" },
      triagem: { variant: "default", label: "Triagem", className: "bg-indigo-500 hover:bg-indigo-600" },
      avaliação: { variant: "default", label: "Avaliação", className: "bg-purple-500 hover:bg-purple-600" },
      contato: { variant: "default", label: "Contato", className: "bg-pink-500 hover:bg-pink-600" },
      "vaga fechada": { variant: "destructive", label: "Fechada", className: "bg-slate-700 hover:bg-slate-800" },
      draft: { variant: "secondary", label: "Rascunho", className: "bg-gray-500 hover:bg-gray-600" },
    } as const
    const config = statusConfig[status] || { variant: "outline", label: status, className: "" }
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${tenantSlug}/jobs`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(job.status)}
              <span className="text-sm text-muted-foreground">
                Criada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${tenantSlug}/jobs/${job.slug}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Vaga
            </Link>
          </Button>
          <ShareDialog
            title={`Compartilhar Vaga: ${job.title}`}
            resourceType="job"
            resourceId={job._id}
            resourceName={job.title}
            tenantSlug={tenantSlug}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="triagem">Triagem</TabsTrigger>
          <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-4">
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
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${job.criteriaWeights.skills}%` }}
                    ></div>
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

          {job.competencies && job.competencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Competências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {job.competencies.map((comp) => (
                    <div key={comp.id} className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <span className="font-medium">{comp.name}</span>
                        {comp.isMandatory && (
                          <Badge variant="outline" className="ml-2">
                            Obrigatória
                          </Badge>
                        )}
                      </div>
                      <Badge variant="secondary">Peso: {comp.weight}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.questions && job.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Perguntas para Candidatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.questions.map((q, index) => (
                    <div key={q.id} className="p-3 border rounded-md">
                      <p className="font-medium">
                        {index + 1}. {q.text}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tipo: {q.type === "open" ? "Aberta" : "Fechada (Múltipla Escolha)"}
                      </p>
                      {q.type === "closed" && q.options && (
                        <div className="mt-2 pl-4">
                          <p className="text-sm font-medium">Opções:</p>
                          <ul className="list-disc pl-4 text-sm">
                            {q.options.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="triagem">
          <Card>
            <CardHeader>
              <CardTitle>Triagem de Candidatos</CardTitle>
              <CardDescription>Gerencie candidatos na fase de triagem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                <Button asChild>
                  <Link href={`/${tenantSlug}/screening?jobId=${job._id}`}>Ir para Triagem</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacao">
          <CandidateRanking
            candidates={candidates}
            jobTitle={job.title}
            jobId={job._id}
            tenantSlug={tenantSlug}
            radarData={radarData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
